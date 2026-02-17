import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isExpert: boolean;
  pixKey?: string;
  balance: number;
  referralCode: string;
  commissionEarned: number;
  trialMinutesLeft: number;
  phoneNumber?: string;
  address?: string;
  safetyModeEnabled?: boolean;
  onboardingCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);

  // State
  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());

  constructor() {
    this.initAuth();
  }

  /**
   * Inicializa a autenticação verificando sessão existente no Supabase
   * e observando mudanças no estado de login.
   */
  private async initAuth() {
    try {
      // 1. Tentar carregar do localStorage primeiro (rápido)
      const stored = localStorage.getItem('ajudai_user');
      if (stored) {
        try {
          this.currentUser.set(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem('ajudai_user');
        }
      }

      // 2. Verificar sessão existente no Supabase
      const { data: { session } } = await this.supabaseService.getSession();
      if (session?.user) {
        await this.loadOrCreateProfile(session.user);
      }

      // 3. Observar mudanças de autenticação
      this.supabaseService.onAuthStateChange(async (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.loadOrCreateProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser.set(null);
          localStorage.removeItem('ajudai_user');
        }
      });
    } catch (error) {
      console.warn('Supabase auth init failed, using localStorage fallback:', error);
    }
  }

  /**
   * Carrega o perfil do Supabase ou cria um novo se não existir.
   */
  private async loadOrCreateProfile(authUser: any): Promise<User | null> {
    try {
      const { data: profile, error } = await this.supabaseService.getProfile(authUser.id);

      if (profile) {
        const user = this.mapProfileToUser(profile);
        this.currentUser.set(user);
        this.saveUser();
        return user;
      } else {
        // Criar perfil novo
        const newProfile = {
          auth_id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          avatar: authUser.user_metadata?.avatar_url || `https://picsum.photos/seed/${Date.now()}/150/150`,
          is_expert: false,
          balance: 0,
          commission_earned: 0,
          trial_minutes_left: 60,
          onboarding_completed: false,
          safety_mode_enabled: false
        };

        const { data: created } = await this.supabaseService.createProfile(newProfile);
        if (created) {
          const user = this.mapProfileToUser(created);
          this.currentUser.set(user);
          this.saveUser();
          return user;
        }
      }
    } catch (e) {
      console.error('Erro ao carregar/criar perfil:', e);
    }
    return null;
  }

  /**
   * Mapeia os dados do perfil do Supabase para a interface User do app.
   */
  private mapProfileToUser(profile: any): User {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || '',
      isExpert: profile.is_expert,
      pixKey: profile.pix_key,
      balance: parseFloat(profile.balance) || 0,
      referralCode: profile.referral_code || this.generateReferralCode(),
      commissionEarned: parseFloat(profile.commission_earned) || 0,
      trialMinutesLeft: profile.trial_minutes_left ?? 60,
      phoneNumber: profile.phone_number,
      address: profile.address,
      safetyModeEnabled: profile.safety_mode_enabled,
      onboardingCompleted: profile.onboarding_completed
    };
  }

  /**
   * Login com Email e Senha via Supabase.
   */
  async loginWithEmail(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.signInWithEmail(email, password);
    if (error) {
      throw new Error(error.message);
    }
    if (data.user) {
      return this.loadOrCreateProfile(data.user);
    }
    return null;
  }

  /**
   * Registro com Email e Senha via Supabase.
   */
  async signUpWithEmail(email: string, password: string, name: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.signUpWithEmail(email, password);
    if (error) {
      throw new Error(error.message);
    }
    if (data.user) {
      // Criar perfil inicial com o nome fornecido
      return this.loadOrCreateProfile({ ...data.user, user_metadata: { full_name: name } });
    }
    return null;
  }

  /**
   * Login com Google OAuth via Supabase.
   */
  async loginWithGoogle(): Promise<User> {
    const { error } = await this.supabaseService.signInWithGoogle();
    if (error) {
      throw new Error(error.message);
    }
    // O perfil será carregado via onAuthStateChange.
    // Retorna um placeholder enquanto o redirect acontece.
    return new Promise((resolve) => {
      const checkUser = setInterval(() => {
        const user = this.currentUser();
        if (user) {
          clearInterval(checkUser);
          resolve(user);
        }
      }, 200);
      // Timeout de segurança (10s)
      setTimeout(() => clearInterval(checkUser), 10000);
    });
  }

  /**
   * Login com Facebook OAuth via Supabase.
   */
  async loginWithFacebook(): Promise<User> {
    const client = this.supabaseService.getClient();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      throw new Error(error.message);
    }
    return new Promise((resolve) => {
      const checkUser = setInterval(() => {
        const user = this.currentUser();
        if (user) {
          clearInterval(checkUser);
          resolve(user);
        }
      }, 200);
      setTimeout(() => clearInterval(checkUser), 10000);
    });
  }

  /**
   * Progressive Profiling: atualiza dados do perfil no Supabase.
   */
  async updateProfile(updates: Partial<User>) {
    const user = this.currentUser();
    if (!user) return;

    // Mapear campos do User para colunas do banco
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.isExpert !== undefined) dbUpdates.is_expert = updates.isExpert;
    if (updates.pixKey !== undefined) dbUpdates.pix_key = updates.pixKey;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.safetyModeEnabled !== undefined) dbUpdates.safety_mode_enabled = updates.safetyModeEnabled;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.trialMinutesLeft !== undefined) dbUpdates.trial_minutes_left = updates.trialMinutesLeft;
    if (updates.commissionEarned !== undefined) dbUpdates.commission_earned = updates.commissionEarned;

    const { data } = await this.supabaseService.updateProfile(user.id, dbUpdates);
    if (data) {
      this.currentUser.set(this.mapProfileToUser(data));
      this.saveUser();
    } else {
      // Fallback local
      this.currentUser.update(u => {
        if (!u) return null;
        return { ...u, ...updates };
      });
      this.saveUser();
    }
  }

  async becomeExpert(category: string, price: number, pixKey: string, phone: string, address: string) {
    await this.updateProfile({
      isExpert: true,
      pixKey: pixKey,
      phoneNumber: phone,
      address: address,
      onboardingCompleted: true
    });
  }

  async addBalance(amount: number) {
    const user = this.currentUser();
    if (!user) return;
    await this.updateProfile({ balance: user.balance + amount });
  }

  processSessionPayment(durationInSeconds: number, pricePerMinCents: number): { cost: number, minutesUsed: number } {
    const user = this.currentUser();
    if (!user) return { cost: 0, minutesUsed: 0 };

    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    let billableMinutes = durationInMinutes;
    let freeMinutesUsed = 0;

    // 1. Consumir trial gratuito
    if (user.trialMinutesLeft > 0) {
      if (user.trialMinutesLeft >= durationInMinutes) {
        freeMinutesUsed = durationInMinutes;
        billableMinutes = 0;
      } else {
        freeMinutesUsed = user.trialMinutesLeft;
        billableMinutes = durationInMinutes - user.trialMinutesLeft;
      }
    }

    // 2. Calcular custo
    const costInEur = (billableMinutes * pricePerMinCents) / 100;

    // 3. Atualizar no Supabase
    this.updateProfile({
      trialMinutesLeft: Math.max(0, user.trialMinutesLeft - freeMinutesUsed),
      balance: Math.max(0, user.balance - costInEur)
    });

    return { cost: costInEur, minutesUsed: freeMinutesUsed };
  }

  async logout() {
    await this.supabaseService.signOut();
    this.currentUser.set(null);
    localStorage.removeItem('ajudai_user');
  }

  private saveUser() {
    if (this.currentUser()) {
      localStorage.setItem('ajudai_user', JSON.stringify(this.currentUser()));
    }
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}