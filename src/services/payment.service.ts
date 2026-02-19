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
      const { data, error } = await this.supabaseService.invokeFunction('stripe-checkout', {
        amount,
        userId,
        currency,
        successUrl: `${window.location.origin}/#/success`,
        cancelUrl: `${window.location.origin}/#/cancel`
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Falha ao gerar link de pagamento.');

      return data.url;
    } catch (err: any) {
      console.error('Stripe Checkout Error:', err);
      throw new Error(err.message || 'Erro ao conectar com o Stripe.');
    }
  }

  /**
   * Legacy method for simulation - should be replaced by createStripeCheckout in UI.
   */
  async processCreditCard(amount: number, card: CreditCardData): Promise<boolean> {
    // Simulation kept for compatibility during transition if needed
    return true;
  }

  /**
   * Simulates checking PIX status (polling)
   */
  async verifyPixPayment(txId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  }
}