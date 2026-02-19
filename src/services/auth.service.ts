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
  onboardingCompleted: boolean;
  personalizedCallLink?: string;
  joinCommunity?: boolean;
  referredBy?: string;
  currency?: string;
  plan?: 'free' | 'pro' | 'premium';
  subscriptionStatus?: 'active' | 'inactive' | 'past_due' | 'canceled';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);

  // State
  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());

  // Helpers de Plano
  isPro = computed(() => {
    const user = this.currentUser();
    return user?.plan === 'pro' && user?.subscriptionStatus === 'active';
  });

  isPremium = computed(() => {
    const user = this.currentUser();
    return user?.plan === 'premium' && user?.subscriptionStatus === 'active';
  });

  isSubscriber = computed(() => this.isPro() || this.isPremium());

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
        console.log(`[AuthService] Auth Event: ${event}`);
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          const pendingRef = localStorage.getItem('ajudai_pending_ref');
          await this.loadOrCreateProfile(session.user, pendingRef || undefined);
          if (pendingRef) localStorage.removeItem('ajudai_pending_ref');
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
  private async loadOrCreateProfile(authUser: any, referralCode?: string): Promise<User | null> {
    try {
      const { data: profile, error } = await this.supabaseService.getProfile(authUser.id);

      if (profile) {
        const user = this.mapProfileToUser(profile);
        this.currentUser.set(user);
        this.saveUser();
        return user;
      } else {
        // Criar perfil novo
        let referredById = null;
        if (referralCode) {
          const { data: referrer } = await this.supabaseService.getProfileByReferralCode(referralCode);
          if (referrer) {
            referredById = referrer.id;
            console.log(`[AuthService] User referred by: ${referredById}`);
          }
        }

        const newProfile = {
          auth_id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          avatar: authUser.user_metadata?.avatar_url || `https://picsum.photos/seed/${Date.now()}/150/150`,
          is_expert: false,
          balance: 0,
          commission_earned: 0,
          trial_minutes_left: 1,
          onboarding_completed: false,
          referred_by: referredById
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
      trialMinutesLeft: profile.trial_minutes_left ?? 1,
      phoneNumber: profile.phone_number,
      address: profile.address,
      onboardingCompleted: profile.onboarding_completed,
      personalizedCallLink: profile.personalized_link || `${window.location.origin}/#/sos?ref=${profile.id}`,
      joinCommunity: profile.join_community ?? false,
      referredBy: profile.referred_by,
      currency: profile.currency || (navigator.language.toLowerCase().includes('br') ? 'BRL' : 'EUR'),
      plan: profile.plan_type || 'free',
      subscriptionStatus: profile.subscription_status || 'inactive'
    };
  }

  /**
   * Login com Email e Senha via Supabase.
   */
  async loginWithEmail(email: string, password: string, referralCode?: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.signInWithEmail(email, password);
    if (error) {
      throw new Error(error.message);
    }
    if (data.user) {
      return this.loadOrCreateProfile(data.user, referralCode);
    }
    return null;
  }

  /**
   * Registro com Email e Senha via Supabase.
   */
  async signUpWithEmail(email: string, password: string, name: string, referralCode?: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.signUpWithEmail(email, password);
    if (error) {
      throw new Error(error.message);
    }
    if (data.user) {
      // Criar perfil inicial com o nome fornecido
      return this.loadOrCreateProfile({ ...data.user, user_metadata: { full_name: name } }, referralCode);
    }
    return null;
  }

  /**
   * Login com Google OAuth via Supabase.
   * Nota: Este método redireciona o navegador, portanto o retorno acontece via onAuthStateChange após o redirect.
   */
  async loginWithGoogle(): Promise<void> {
    const { error } = await this.supabaseService.signInWithGoogle();
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Login com Facebook OAuth via Supabase.
   * Nota: Redireciona o navegador.
   */
  async loginWithFacebook(): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      throw new Error(error.message);
    }
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
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.trialMinutesLeft !== undefined) dbUpdates.trial_minutes_left = updates.trialMinutesLeft;
    if (updates.commissionEarned !== undefined) dbUpdates.commission_earned = updates.commissionEarned;
    if (updates.personalizedCallLink !== undefined) dbUpdates.personalized_link = updates.personalizedCallLink;
    if (updates.joinCommunity !== undefined) dbUpdates.join_community = updates.joinCommunity;

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

    // Atualizar saldo do usuário
    await this.updateProfile({ balance: user.balance + amount });

    // Lógica de Comissão: Se o usuário foi indicado, o padrinho ganha 5%
    if (user.referredBy) {
      try {
        const commissionAmount = amount * 0.05;
        const { data: referrerProfile } = await this.supabaseService.getProfile(user.referredBy);

        if (referrerProfile) {
          const newReferrerBalance = (parseFloat(referrerProfile.balance) || 0) + commissionAmount;
          const newReferrerCommission = (parseFloat(referrerProfile.commission_earned) || 0) + commissionAmount;

          await this.supabaseService.updateProfile(user.referredBy, {
            balance: newReferrerBalance,
            commission_earned: newReferrerCommission
          });

          console.log(`[AuthService] Commission of ${commissionAmount} awarded to referrer ${user.referredBy}`);
        }
      } catch (err) {
        console.error('Erro ao processar comissão:', err);
      }
    }
  }

  async processSessionPayment(durationInSeconds: number, pricePerMinCents: number, expertId: string): Promise<{ cost: number, minutesUsed: number, platformCommission: number }> {
    const user = this.currentUser();
    if (!user) return { cost: 0, minutesUsed: 0, platformCommission: 0 };

    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    let billableMinutes = durationInMinutes;
    let freeMinutesUsed = 0;

    // 1. Consumir trial gratuito (agora 1 minuto para novos usuários)
    if (user.trialMinutesLeft > 0) {
      if (user.trialMinutesLeft >= durationInMinutes) {
        freeMinutesUsed = durationInMinutes;
        billableMinutes = 0;
      } else {
        freeMinutesUsed = user.trialMinutesLeft;
        billableMinutes = durationInMinutes - user.trialMinutesLeft;
      }
    }

    // Se for Premium (Plano de 19,90), o usuário NÃO PAGA pelos minutos?
    // "Premium. 19,90. (acesso ao tempo liberado ilimitado)"
    // Interpretação: O usuário paga R$19,90 e tem uso ILIMITADO da plataforma sem pagar por minuto?
    // ISSO SERIA INSUSTENTÁVEL se o especialista recebe por minuto.
    // "acesso ao tempo liberado ilimitado" pode significar que não tem limite de TEMPO na chamada (não cai), mas paga por minuto.
    // OU pode ser que o usuário Premium paga a mensalidade E o especialista, mas com TAXA ZERO da plataforma.
    // O user disse: "Premium. 19,90. (acesso ao tempo liberado ilimitado)"
    // Vamos assumir: Taxa da plataforma ZERO. O usuário ainda paga o especialista.
    // Se fosse "Tudo grátis", o especialista trabalharia de graça? Não faz sentido.
    // Vou assumir que:
    // PRO: Paga taxa reduzida.
    // PREMIUM: Paga taxa zero da plataforma (só o valor do especialista).

    // 2. Calcular custo total do usuário
    const costInEur = (billableMinutes * pricePerMinCents) / 100;

    // 3. Calcular comissão da plataforma
    // Padrão: 5% (definido anteriormente)
    // Se for Premium: 0%
    // Se for Pro: 2.5% (metade)

    let commissionRate = 0.05;
    if (this.isPremium()) {
      commissionRate = 0;
    } else if (this.isPro()) {
      commissionRate = 0.025;
    }

    const platformCommission = costInEur * commissionRate;
    const expertEarnings = costInEur - platformCommission;

    // 4. Atualizar saldo do cliente e trial no Supabase
    await this.updateProfile({
      trialMinutesLeft: Math.max(0, user.trialMinutesLeft - freeMinutesUsed),
      balance: Math.max(0, user.balance - costInEur)
    });

    // 5. Transferir valor para a carteira do especialista
    if (expertEarnings > 0) {
      try {
        // Buscar o perfil do especialista via expertId
        const { data: expertData } = await this.supabaseService.getExpertById(expertId);
        if (expertData && expertData.profile_id) {
          const { data: expertProfile } = await this.supabaseService.getProfileById(expertData.profile_id);

          if (expertProfile) {
            const currentExpertBalance = parseFloat(expertProfile.balance) || 0;
            await this.supabaseService.updateProfile(expertData.profile_id, {
              balance: currentExpertBalance + expertEarnings
            });
            console.log(`[AJUDAÍ] Pagamento de ${expertEarnings.toFixed(2)} enviado para a carteira do especialista ${expertId}`);
          }
        }
      } catch (err) {
        console.error('Erro ao processar pagamento do especialista:', err);
      }
    }

    console.log(`[AJUDAÍ] Trabalho concluído. Comissão da plataforma: ${platformCommission.toFixed(2)}`);

    return { cost: costInEur, minutesUsed: freeMinutesUsed, platformCommission };
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