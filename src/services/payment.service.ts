import { Injectable } from '@angular/core';

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

  constructor() { }

  /**
   * Simulates a transaction with a provider like Stripe or MercadoPago.
   */
  async processCreditCard(amount: number, card: CreditCardData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Basic validation simulation
      const cleanNumber = card.number.replace(/\s/g, '');
      
      if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        reject('Número de cartão inválido.');
        return;
      }

      // Simulate network latency (1.5s - 3s)
      const delay = Math.floor(Math.random() * 1500) + 1500;

      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        
        if (success) {
          resolve(true);
        } else {
          reject('Transação recusada pelo banco emissor.');
        }
      }, delay);
    });
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