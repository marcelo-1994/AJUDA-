import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ExpertService, Expert } from '../services/expert.service';
import { AuthService } from '../services/auth.service';
import { PaymentGatewayService, PaymentStatus } from '../services/payment.service';
import { CurrencyService } from '../services/currency.service';

@Component({
  selector: 'app-expert-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade pb-20">
      <main class="max-w-5xl mx-auto px-4 sm:px-6">
        
        <!-- AI Insight Card -->
        <div class="glass rounded-[2rem] p-8 mb-10 shadow-premium border border-black/5 relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]"></div>
          
          <div class="flex items-start gap-6 relative z-10">
            <div class="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-black text-slate-900 mb-2 font-display">Análise do teu problema</h2>
              <p class="text-slate-500 text-[15px] font-medium leading-relaxed mb-4">
                Com base na tua descrição, identificámos especialistas qualificados em:
                <span class="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wide ml-1 animate-slide">{{ category() }}</span>
              </p>
              @if (quickTip()) {
                <div class="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <p class="text-[14px] text-slate-700 font-semibold leading-relaxed flex gap-3">
                    <span class="text-lg">💡</span>
                    <span>{{ quickTip() }}</span>
                  </p>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-8">
          <h3 class="text-2xl font-black text-slate-900 tracking-tight font-display">Encontrámos {{ filteredExperts().length }} especialistas</h3>
          <div class="flex gap-2">
            <button class="p-2 bg-white rounded-xl border border-black/5 text-slate-400 hover:text-slate-900 shadow-sm transition-all"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4.5h18m-18 5h18m-18 5h18m-18 5h18"/></svg></button>
          </div>
        </div>

        <!-- Expert Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (expert of filteredExperts(); track expert.id) {
            <div class="bg-white rounded-[2rem] p-6 shadow-premium border border-black/5 hover:translate-y-[-6px] transition-all duration-500 group relative">
              
              <!-- Card Header -->
              <div class="flex items-start justify-between mb-6">
                <div class="relative">
                   <div class="w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all">
                      <img [src]="expert.avatarUrl" [alt]="expert.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                   </div>
                   @if (expert.isOnline) {
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                   }
                </div>
                <div class="text-right">
                  <div class="font-black text-xl text-slate-900 tracking-tight leading-none">{{ currencyService.formatSimple(expert.pricePerMin / 100) }}</div>
                  <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">/ minuto</div>
                </div>
              </div>

              <!-- Content -->
              <div class="mb-6">
                <h4 class="font-bold text-lg text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{{ expert.name }}</h4>
                
                <div class="flex items-center gap-1.5 mb-4">
                  <div class="flex text-yellow-400">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </div>
                  <span class="font-bold text-slate-900 text-xs">{{ expert.rating }}</span>
                  <span class="text-slate-400 text-[10px] font-bold">({{ expert.reviews }} sessões)</span>
                </div>
                
                <div class="flex flex-wrap gap-2">
                  @for (spec of expert.specialties; track spec) {
                    <span class="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg border border-black/5">{{ spec }}</span>
                  }
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  (click)="prepareConsultation(expert)"
                  [disabled]="!expert.isOnline"
                  class="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg group/btn"
                  [class]="expert.isOnline ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500' : 'bg-slate-100 text-slate-400 opacity-50'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover/btn:scale-110 transition-transform">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Ligar
                </button>

                <div class="flex gap-2">
                  <button (click)="openSchedule(expert)" class="flex-1 flex items-center justify-center bg-white border border-black/5 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </button>
                  <button (click)="openMessage(expert)" class="flex-1 flex items-center justify-center bg-white border border-black/5 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        @if (filteredExperts().length === 0) {
          <div class="text-center py-20">
            <div class="inline-block p-6 bg-white rounded-full mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-slate-300">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Nenhum especialista encontrado</h3>
            <p class="text-slate-500 mt-2 font-medium">Tenta simplificar a tua pesquisa.</p>
            <button (click)="resetSearch()" class="mt-6 text-blue-600 font-bold hover:underline">Ver todos os especialistas</button>
          </div>
        }
      </main>

      <!-- GATEWAY PAYMENT MODAL -->
      @if (showPaymentModal()) {
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-6">
           <!-- Backdrop -->
           <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-fade" (click)="closePaymentModal()"></div>
           
           <!-- Modal Content -->
           <div class="bg-white w-full max-w-sm rounded-[3rem] shadow-premium overflow-hidden relative animate-zoom-in">
              
              <!-- Header -->
              <div class="bg-slate-900 p-8 text-center text-white relative">
                 <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                 <h3 class="text-xl font-black relative z-10 font-display">Carregar Carteira</h3>
                 <p class="text-slate-400 text-xs font-black uppercase tracking-widest relative z-10 mt-2">Saldo a Adicionar</p>
                 <div class="mt-4 text-5xl font-black text-white relative z-10 tracking-tight">{{ currencyService.formatSimple(5) }}</div>
              </div>
              
              <div class="p-8 bg-white relative z-20">
                 
                 <!-- Tabs -->
                 <div class="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
                    <button 
                      (click)="selectedMethod.set('pix')"
                      [class]="selectedMethod() === 'pix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                      class="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300">
                      PIX
                    </button>
                    <button 
                      (click)="selectedMethod.set('card')"
                      [class]="selectedMethod() === 'card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                      class="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300">
                      Cartão
                    </button>
                 </div>

                 <!-- ERROR MESSAGE -->
                 @if (errorMessage()) {
                   <div class="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-slide">
                      <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      {{ errorMessage() }}
                   </div>
                 }

                 <!-- METHOD: PIX -->
                 @if (selectedMethod() === 'pix') {
                    <div class="text-center animate-fade">
                        <p class="text-[13px] font-semibold text-slate-500 mb-6">
                           Pagamento instantâneo via Banco Central.
                        </p>
                        
                        <!-- QR Code -->
                        <div class="bg-white p-4 border border-blue-100 shadow-xl shadow-blue-500/5 rounded-[2rem] w-48 h-48 mx-auto mb-6 flex items-center justify-center relative overflow-hidden group">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=marcelosilvareisok@gmail.com" 
                                 alt="PIX QR Code" class="w-full h-full mix-blend-multiply transition-transform duration-700 group-hover:scale-110">
                            <div class="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none"></div>
                        </div>

                        <!-- Pix Key -->
                        <div class="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-8 border border-black/5">
                            <div class="flex-1 truncate font-mono text-[11px] text-slate-500 font-bold">
                               marcelosilvareisok@gmail.com
                            </div>
                            <button (click)="copyPix()" class="bg-blue-600 text-white font-black text-[10px] px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors uppercase tracking-widest active:scale-90">Copiar</button>
                        </div>

                        <button 
                          (click)="processPixPayment()" 
                          [disabled]="paymentStatus() === 'processing'"
                          class="w-full py-4.5 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-black rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                           @if (paymentStatus() === 'processing') {
                             <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Processando...
                           } @else {
                             Confirmar Pagamento
                           }
                        </button>
                    </div>
                 }

                  <!-- METHOD: CREDIT CARD (STRIPE) -->
                  @if (selectedMethod() === 'card') {
                     <div class="text-center py-4 animate-fade">
                        <div class="bg-blue-50 p-6 rounded-[2rem] mb-8 border border-blue-100 flex flex-col items-center">
                          <p class="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-4">Segurança Garantida</p>
                          <div class="flex items-center justify-center gap-5 opacity-40 grayscale">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" class="h-6">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" class="h-5">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" class="h-6">
                          </div>
                        </div>

                        <button 
                          (click)="processStripePayment()" 
                          [disabled]="paymentStatus() === 'processing'"
                          class="w-full py-5 bg-[#635BFF] hover:bg-[#5851E1] disabled:bg-slate-300 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                            @if (paymentStatus() === 'processing') {
                              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              Conectando...
                            } @else {
                              Pagar com Stripe
                            }
                        </button>
                        <p class="text-[11px] text-slate-400 mt-6 font-bold uppercase tracking-wide">checkout seguro através da stripe inc.</p>
                     </div>
                  }

                 <button (click)="closePaymentModal()" [disabled]="paymentStatus() === 'processing'" class="w-full py-4 mt-2 text-slate-300 font-black hover:text-slate-900 transition-colors text-[11px] uppercase tracking-widest disabled:opacity-50">
                    Fechar
                 </button>
              </div>
           </div>
        </div>
      }

      <!-- SCHEDULE MODAL -->
      @if (showScheduleModal()) {
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-6">
           <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-fade" (click)="showScheduleModal.set(false)"></div>
           <div class="bg-white w-full max-w-sm rounded-[3rem] shadow-premium p-8 relative animate-zoom-in">
              <h3 class="text-2xl font-black text-slate-900 mb-8 font-display">Agendar Sessão</h3>
              
              <div class="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-black/5">
                <img [src]="selectedExpertForAction()?.avatarUrl" class="w-12 h-12 rounded-xl object-cover">
                <div>
                   <p class="font-bold text-slate-900">{{ selectedExpertForAction()?.name }}</p>
                   <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Especialista disponível</p>
                </div>
              </div>

              <div class="space-y-6">
                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Selecionar Data</label>
                   <div class="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
                     @for (day of ['Hoje', 'Amanhã', '22 Fev', '23 Fev']; track day) {
                       <button class="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all whitespace-nowrap active:scale-95 shadow-sm">
                         {{ day }}
                       </button>
                     }
                   </div>
                 </div>

                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Horários Disponíveis</label>
                   <div class="grid grid-cols-3 gap-2.5">
                     @for (time of ['09:00', '10:30', '14:00', '15:30', '17:00']; track time) {
                        <button class="py-3 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all active:scale-95 uppercase tracking-wider">
                          {{ time }}
                        </button>
                     }
                   </div>
                 </div>
              </div>

              <div class="mt-10 flex gap-4">
                 <button (click)="showScheduleModal.set(false)" class="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:text-slate-900 transition-colors">Cancelar</button>
                 <button (click)="confirmSchedule()" class="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 text-[11px] uppercase tracking-widest">Confirmar</button>
              </div>
           </div>
        </div>
      }

      <!-- MESSAGE / CHAT MODAL -->
      @if (showMessageModal()) {
        <div class="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
           <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-fade" (click)="showMessageModal.set(false)"></div>
           
           <div class="bg-white w-full sm:max-w-md h-[85vh] sm:h-[650px] sm:rounded-[3rem] rounded-t-[3rem] shadow-premium flex flex-col animate-slide-up sm:animate-zoom-in overflow-hidden relative z-10">
              
              <!-- Header -->
              <div class="p-6 border-b border-black/5 flex items-center justify-between bg-white z-20">
                 <div class="flex items-center gap-4">
                    <div class="relative">
                      <img [src]="selectedExpertForAction()?.avatarUrl" class="w-12 h-12 rounded-2xl object-cover border border-black/5 shadow-sm">
                      <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 class="font-black text-slate-900 tracking-tight text-base">{{ selectedExpertForAction()?.name }}</h3>
                      <p class="text-[10px] text-green-500 font-black uppercase tracking-widest">Online agora</p>
                    </div>
                 </div>
                 <button (click)="showMessageModal.set(false)" class="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <!-- Chat Area -->
              <div class="flex-1 bg-slate-50/50 p-6 overflow-y-auto space-y-6 relative" (click)="messageInputRef.blur()">
                 <div class="flex justify-center mb-4">
                    <span class="text-[9px] uppercase font-black text-slate-400 bg-white border border-black/5 px-3 py-1 rounded-full shadow-sm tracking-widest">Início da Conversa</span>
                 </div>
                 
                 <div class="flex gap-3 max-w-[85%] group">
                    <img [src]="selectedExpertForAction()?.avatarUrl" class="w-8 h-8 rounded-xl object-cover mt-auto shadow-sm">
                    <div class="bg-white p-4 rounded-[1.5rem] rounded-bl-none shadow-sm text-[13px] text-slate-600 font-medium leading-relaxed border border-black/5">
                       Olá! Vi que o teu problema foi identificado como <span class="text-blue-600 font-bold">{{ category() }}</span>. Como posso ajudar agora?
                    </div>
                 </div>
                 
                 @if (lastSentMessage()) {
                    <div class="flex gap-3 max-w-[85%] ml-auto flex-row-reverse animate-slide">
                        <img [src]="authService.currentUser()?.avatar" class="w-8 h-8 rounded-xl object-cover mt-auto shadow-sm">
                        <div class="bg-blue-600 p-4 rounded-[1.5rem] rounded-br-none shadow-premium text-[13px] text-white font-medium leading-relaxed">
                           {{ lastSentMessage() }}
                        </div>
                    </div>
                 }
              </div>

              <!-- Input Area -->
              <div class="p-6 bg-white border-t border-black/5 pb-safe z-20">
                 <div class="flex items-center gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-200 transition-all">
                    <button class="p-3 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-white shadow-sm">
                       <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                    <input 
                        #messageInputRef
                        type="text" 
                        [ngModel]="messageInput()"
                        (ngModelChange)="messageInput.set($event)"
                        (keyup.enter)="sendMessage()"
                        placeholder="Escreve a tua mensagem..." 
                        class="flex-1 bg-transparent text-sm font-medium outline-none px-2 py-1 text-slate-900 placeholder:text-slate-400 h-10 w-full"
                    >
                    <button 
                        (click)="sendMessage()"
                        [disabled]="!messageInput()"
                        class="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up {
      animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes zoom-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-zoom-in {
      animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    /* iOS Safe Area for bottom input */
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 20px);
    }
  `]
})
export class ExpertListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expertService = inject(ExpertService);
  public authService = inject(AuthService);
  private paymentService = inject(PaymentGatewayService);
  private fb: FormBuilder = inject(FormBuilder);
  public currencyService = inject(CurrencyService);

  category = signal('Outros');
  quickTip = signal('');

  experts = this.expertService.getExperts();

  filteredExperts = computed(() => {
    const cat = this.category();
    return this.expertService.filterExpertsByCategory(cat);
  });

  // Action Modals State
  showScheduleModal = signal(false);
  showMessageModal = signal(false);
  selectedExpertForAction = signal<Expert | null>(null);

  // Message Logic
  messageInput = signal('');
  lastSentMessage = signal('');

  sendMessage() {
    if (!this.messageInput().trim()) return;
    this.lastSentMessage.set(this.messageInput());
    this.messageInput.set('');
    // TODO: Send to backend
  }

  // Payment Logic State
  showPaymentModal = signal(false);
  selectedExpertId: string | null = null;
  selectedMethod = signal<'pix' | 'card'>('pix');
  paymentStatus = signal<PaymentStatus>('idle');
  errorMessage = signal<string>('');

  // Forms
  cardForm: FormGroup = this.fb.group({
    number: ['', [Validators.required, Validators.minLength(16), Validators.pattern(/^[0-9\s]*$/)]],
    holder: ['', [Validators.required, Validators.minLength(3)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
    cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.category.set(params['category']);
      }
      if (params['tip']) {
        this.quickTip.set(params['tip']);
      }
    });
  }

  prepareConsultation(expert: Expert) {
    if (!this.authService.isLoggedIn()) {
      alert('Por favor, faça login primeiro.');
      this.authService.loginWithGoogle();
      return;
    }

    const user = this.authService.currentUser();

    // Logic: If user has trial minutes, allow entry. Else, check balance.
    if (user && user.trialMinutesLeft > 0) {
      this.router.navigate(['/room', expert.id]);
    } else if (user && user.balance < 5) {
      this.selectedExpertId = expert.id;
      this.openPaymentModal();
    } else {
      // Has money, go directly
      this.router.navigate(['/room', expert.id]);
    }
  }

  openPaymentModal() {
    this.paymentStatus.set('idle');
    this.errorMessage.set('');
    this.selectedMethod.set('pix');
    this.cardForm.reset();
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    if (this.paymentStatus() !== 'processing') {
      this.showPaymentModal.set(false);
    }
  }

  copyPix() {
    const pixKey = "marcelosilvareisok@gmail.com";
    navigator.clipboard.writeText(pixKey);
    // Visual feedback handled by user logic usually, alert is fine for now
    alert('Chave PIX copiada!');
  }

  async processPixPayment() {
    this.paymentStatus.set('processing');
    this.errorMessage.set('');

    try {
      // In progress: This should eventually poll a real Supabase Edge Function for transaction status
      // For now, we removed the simulated verification to point out it needs real implementation.
      alert('Aguardando confirmação do pagamento via Webhook...');
      this.paymentStatus.set('idle');
      this.showPaymentModal.set(false);
    } catch (err) {
      this.paymentStatus.set('error');
      this.errorMessage.set('Erro ao verificar PIX. Tente novamente.');
    }
  }

  async processStripePayment() {
    this.paymentStatus.set('processing');
    this.errorMessage.set('');

    try {
      const user = this.authService.currentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      // Create Checkout Session and Redirect
      const url = await this.paymentService.createStripeCheckout(
        5.00,
        user.id,
        this.currencyService.code
      );

      window.location.href = url;
    } catch (error: any) {
      this.paymentStatus.set('error');
      this.errorMessage.set(error.message || 'Erro ao iniciar pagamento Stripe.');
    }
  }

  finalizeSuccess() {
    this.paymentStatus.set('success');
    this.authService.addBalance(5); // Add 5 EUR

    setTimeout(() => {
      this.showPaymentModal.set(false);
      alert('Pagamento confirmado! A iniciar chamada...');
      if (this.selectedExpertId) {
        this.router.navigate(['/room', this.selectedExpertId]);
      }
    }, 500);
  }

  resetSearch() {
    this.category.set('Outros');
    this.router.navigate(['/results'], { queryParams: { category: 'Outros' } });
  }

  // --- NEW ACTIONS ---
  openSchedule(expert: Expert) {
    this.selectedExpertForAction.set(expert);
    this.showScheduleModal.set(true);
  }

  confirmSchedule() {
    this.showScheduleModal.set(false);
    alert('Agendamento solicitado com sucesso! O especialista irá confirmar.');
  }

  openMessage(expert: Expert) {
    this.selectedExpertForAction.set(expert);
    this.showMessageModal.set(true);
  }
}