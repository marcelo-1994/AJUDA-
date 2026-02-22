import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CurrencyService } from '../services/currency.service';
import { PaymentGatewayService } from '../services/payment.service';

@Component({
    selector: 'app-wallet',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="animate-fade pb-20">
      <main class="max-w-4xl mx-auto px-4 sm:px-6">
        
        <!-- Header -->
        <div class="mb-10">
          <h2 class="text-3xl font-black text-slate-900 tracking-tight font-display mb-2">Minha Carteira</h2>
          <p class="text-slate-500 font-medium">Gere o seu saldo e histórico de consultas.</p>
        </div>

        <!-- Balance Card -->
        <div class="glass rounded-[2.5rem] p-10 mb-10 shadow-premium border border-black/5 relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px]"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Saldo Disponível</p>
              <h3 class="text-6xl font-black text-slate-900 tracking-tighter">
                {{ currencyService.formatSimple(authService.currentUser()?.balance || 0) }}
              </h3>
              @if (authService.currentUser()?.trialMinutesLeft) {
                <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 font-bold text-xs">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  +{{ authService.currentUser()?.trialMinutesLeft }} minutos grátis
                </div>
              }
            </div>
            
            <button (click)="openDepositModal()" class="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:translate-y-[-2px] transition-all active:scale-95">
              Adicionar Saldo
            </button>
          </div>
        </div>

        <!-- Quick Top-up Options -->
        <div class="mb-12">
          <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Recarga Rápida</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (amount of [10, 25, 50, 100]; track amount) {
              <button class="bg-white p-6 rounded-[2rem] border border-black/5 shadow-premium hover:border-blue-500/50 hover:bg-blue-50/30 transition-all group text-center active:scale-95">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-blue-600">Pacote</div>
                <div class="text-xl font-black text-slate-900 group-hover:text-blue-700">{{ currencyService.formatSimple(amount) }}</div>
              </button>
            }
          </div>
        </div>

        <!-- Transaction History -->
        <div>
          <div class="flex items-center justify-between mb-6 px-2">
            <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Atividade Recente</h4>
            <button class="text-xs font-bold text-blue-600 hover:underline">Ver Tudo</button>
          </div>
          
          <div class="space-y-4">
            @for (tx of transactions(); track tx.id) {
              <div class="bg-white p-5 rounded-3xl border border-black/5 flex items-center justify-between shadow-premium transition-all hover:scale-[1.01] group">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm" [class]="tx.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'">
                    {{ tx.type === 'deposit' ? '📥' : '💬' }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 text-sm">{{ tx.description }}</p>
                    <p class="text-[11px] text-slate-400 font-medium">{{ tx.date }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-black text-sm" [class]="tx.type === 'deposit' ? 'text-green-600' : 'text-slate-900'">
                    {{ tx.type === 'deposit' ? '+' : '-' }}{{ currencyService.formatSimple(tx.amount) }}
                  </p>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Concluído</p>
                </div>
              </div>
            } @empty {
              <div class="bg-white rounded-[2rem] p-12 text-center border border-black/5 shadow-premium">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                   💳
                </div>
                <p class="text-slate-400 font-bold text-sm">Ainda não tens transações.</p>
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class WalletComponent {
    authService = inject(AuthService);
    currencyService = inject(CurrencyService);
    paymentService = inject(PaymentGatewayService);

    transactions = signal([
        { id: 1, type: 'deposit', description: 'Recarga via PIX', amount: 50, date: 'Hoje, 14:20' },
        { id: 2, type: 'call', description: 'Consulta com Dr. Ricardo', amount: 15, date: 'Ontem, 18:45' },
        { id: 3, type: 'call', description: 'Consulta com Maria Silva', amount: 20, date: '18 Fev, 10:30' }
    ]);

    openDepositModal() {
        // Para simplificar, poderíamos usar um serviço global de modals
        // ou apenas emitir um evento. Por enquanto, mostraremos como integrar.
        alert('A redirecionar para depósito...');
    }
}
