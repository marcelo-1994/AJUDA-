import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any)?.env?.['SUPABASE_URL'] || 'https://zuprnalsdigsosonzeme.supabase.co';
const SUPABASE_KEY = (import.meta as any)?.env?.['SUPABASE_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHJuYWxzZGlnc29zb256ZW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDg3NDMsImV4cCI6MjA4NjkyNDc0M30.HrboOMuhN4jVVYVsjB4I1fzhowH7REbGv0ggnaAML04';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient | null = null;
    private initError: boolean = false;

    constructor() {
        try {
            this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            this.initError = true;
        }
    }

    /**
     * Retorna a instância do cliente Supabase para uso direto.
     */
    getClient(): SupabaseClient | null {
        return this.supabase;
    }

    /**
     * Verifica se o Supabase está disponível.
     */
    isAvailable(): boolean {
        return this.supabase !== null && !this.initError;
    }

    // ============================
    // AUTH
    // ============================

    async signInWithGoogle() {
        if (!this.supabase) throw new Error('Supabase not initialized');

        // Em produção, o origin será a URL do Vercel. 
        // Em dev, será http://localhost:3000
        const redirectTo = window.location.origin;

        return this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });
    }

    async signInWithEmail(email: string, password: string) {
        if (!this.supabase) throw new Error('Supabase not initialized');
        return this.supabase.auth.signInWithPassword({ email, password });
    }

    async signUpWithEmail(email: string, password: string) {
        if (!this.supabase) throw new Error('Supabase not initialized');
        return this.supabase.auth.signUp({ email, password });
    }

    async getSession() {
        if (!this.supabase) return { data: { session: null }, error: null };
        return this.supabase.auth.getSession();
    }

    async getUser() {
        if (!this.supabase) return { data: { user: null }, error: null };
        return this.supabase.auth.getUser();
    }

    async signOut() {
        if (!this.supabase) return { error: null };
        return this.supabase.auth.signOut();
    }

    onAuthStateChange(callback: (event: string, session: any) => void) {
        if (!this.supabase) return { data: { subscription: { unsubscribe: () => { } } } };
        return this.supabase.auth.onAuthStateChange(callback);
    }

    // ============================
    // PROFILES
    // ============================

    async getProfile(authId: string) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('profiles')
            .select('*')
            .eq('auth_id', authId)
            .single();
    }

    async getProfileById(id: string) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
    }

    async createProfile(profile: any) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('profiles')
            .insert(profile)
            .select()
            .single();
    }

    async getProfileByReferralCode(code: string) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', code.toUpperCase())
            .single();
    }

    async updateProfile(id: string, updates: any) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
    }

    // ============================
    // EXPERTS
    // ============================

    async getExperts() {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('experts')
            .select('*')
            .order('rating', { ascending: false });
    }

    async getExpertById(id: string) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('experts')
            .select('*')
            .eq('id', id)
            .single();
    }

    async getExpertsByCategory(category: string) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('experts')
            .select('*')
            .eq('category', category);
    }

    async addExpert(expert: any) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('experts')
            .insert(expert)
            .select()
            .single();
    }

    async updateExpert(id: string, updates: any) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('experts')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
    }

    // ============================
    // CATEGORIES
    // ============================

    async getCategories() {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('categories')
            .select('*')
            .order('name');
    }

    // ============================
    // SESSIONS
    // ============================

    async createSession(session: any) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('sessions')
            .insert(session)
            .select()
            .single();
    }

    async updateSession(id: string, updates: any) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('sessions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
    }

    async getSessionsByUser(userId: string) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('sessions')
            .select('*, experts(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    }

    // ============================
    // PAYMENTS
    // ============================

    async createPayment(payment: any) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('payments')
            .insert(payment)
            .select()
            .single();
    }

    async getPaymentsByUser(userId: string) {
        if (!this.supabase) return { data: null, error: 'Not initialized' };
        return this.supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    }

    async invokeFunction(name: string, body: any) {
        if (!this.supabase) throw new Error('Supabase not initialized');
        return this.supabase.functions.invoke(name, {
            body: body
        });
    }

    async createCheckoutSession(amount: number, successUrl: string, cancelUrl: string, mode: 'payment' | 'subscription' = 'payment', plan?: string) {
        if (!this.supabase) throw new Error('Supabase not initialized');

        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('User not logged in');

        return this.supabase.functions.invoke('stripe-checkout', {
            body: {
                amount,
                userId: user.id, // Mandatory for the edge function
                successUrl,
                cancelUrl,
                type: mode,     // Edge function expects 'type', not 'mode'
                plan: plan      // Edge function expects 'plan', not 'priceId'
            }
        });
    }
}
