import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface CreditCardData {
  number: string;
  holder: string;
  expiry: string;
  cvc: string;
}

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
  private supabaseService = inject(SupabaseService);

  constructor() { }

  /**
   * Creates a real Stripe Checkout session using Supabase Edge Functions.
   */
  async createStripeCheckout(amount: number, userId: string, currency: string = 'eur'): Promise<string> {
    try {
      // Usando o método centralizado do SupabaseService
      const { data, error } = await this.supabaseService.createCheckoutSession(
        amount,
        `${window.location.origin}/#/success`,
        `${window.location.origin}/#/cancel`,
        'payment',
        undefined,
        currency
      );

      if (error) throw error;
      if (!data?.url) throw new Error('Falha ao gerar link de pagamento.');

      return data.url;
    } catch (err: any) {
      console.error('Stripe Checkout Error:', err);
      throw new Error(err.message || 'Erro ao conectar com o Stripe.');
    }
  }

  /**
   * Stripe Checkout is now the primary payment method.
   * PIX simulation has been removed to encourage real integration.
   */
}