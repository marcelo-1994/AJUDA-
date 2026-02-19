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
    <div class="min-h-screen bg-[#F2F2F7] pb-20 font-sans">
      
      <!-- Sticky Glass Header -->
      <header class="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-black/5 supports-[backdrop-filter]:bg-white/60">
        <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-2xl font-bold tracking-tight text-slate-900 hover:opacity-70 transition-opacity">
            AJUDA<span class="text-blue-600">Í</span>
          </a>
          
          <div class="flex items-center gap-4">
             @if (authService.currentUser()) {
                <div class="flex flex-col items-end">
                  <div class="text-[11px] uppercase tracking-wide font-bold text-slate-400">Saldo</div>
                  <div class="text-sm font-bold text-slate-900">{{ currencyService.formatSimple(authService.currentUser()?.balance || 0) }}</div>
                  @if (authService.currentUser()?.trialMinutesLeft) {
                     <div class="text-[10px] text-amber-600 font-bold bg-amber-100 px-1.5 rounded">+{{ authService.currentUser()?.trialMinutesLeft }}m Grátis</div>
                  }
                </div>
                <img [src]="authService.currentUser()?.avatar" class="w-9 h-9 rounded-full shadow-sm">
             } @else {
               <button (click)="authService.loginWithGoogle()" class="text-sm font-bold text-blue-600">Entrar</button>
             }
          </div>
        </div>
      </header>

      <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        <!-- AI Insight Card (iOS Widget Style) -->
        <div class="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2rem] p-8 text-white mb-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div class="flex items-start gap-5 relative z-10">
            <div class="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold mb-2">Análise Inteligente</h2>
              <p class="text-blue-100 text-[15px] font-medium leading-relaxed mb-4">
                Identificámos que o teu problema é de <span class="font-bold text-white bg-white/20 px-2 py-0.5 rounded-lg text-xs uppercase tracking-wide ml-1">{{ category() }}</span>.
              </p>
              @if (quickTip()) {
                <div class="bg-black/10 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                  <p class="text-[14px] font-medium leading-normal">💡 <span class="opacity-90">{{ quickTip() }}</span></p>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Especialistas</h3>
          <span class="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">{{ filteredExperts().length }} disponíveis</span>
        </div>

        <!-- Expert Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (expert of filteredExperts(); track expert.id) {
            <div class="bg-white rounded-[1.5rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col group border border-black/5 hover:-translate-y-1 relative overflow-hidden">
              
              <!-- Card Header -->
              <div class="flex items-start justify-between mb-5 z-10">
                <div class="relative">
                   <div class="w-[4.5rem] h-[4.5rem] rounded-[1.2rem] overflow-hidden shadow-md">
                      <img [src]="expert.avatarUrl" [alt]="expert.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                   </div>
                   @if (expert.isOnline) {
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                   }
                </div>
                <div class="text-right">
                  <div class="font-bold text-xl text-slate-900 tracking-tight">{{ currencyService.formatSimple(expert.pricePerMin / 100) }}</div>
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wide">/ min</div>
                </div>
              </div>

              <!-- Content -->
              <div class="mb-5 z-10">
                <h4 class="font-bold text-lg text-slate-900 leading-tight mb-1">{{ expert.name }}</h4>
                <div class="flex items-center gap-1.5 text-sm mb-3">
                  <div class="flex text-yellow-400">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </div>
                  <span class="font-semibold text-slate-700">{{ expert.rating }}</span>
                  <span class="text-slate-400 text-xs">({{ expert.reviews }} avaliações)</span>
                </div>
                
                <div class="flex flex-wrap gap-2">
                  @for (spec of expert.specialties; track spec) {
                    <span class="px-2.5 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wide rounded-md">{{ spec }}</span>
                  }
                </div>
                </div>

                <div class="mt-4 flex gap-2">
                  <div class="flex-1 bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                     <div class="text-[10px] text-slate-400 font-bold uppercase">Resposta</div>
                     <div class="font-bold text-slate-700 text-sm">~5 min</div>
                  </div>
                  <div class="flex-1 bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                     <div class="text-[10px] text-slate-400 font-bold uppercase">Aulas</div>
                     <div class="font-bold text-slate-700 text-sm">{{ expert.reviews > 10 ? '100+' : expert.reviews }}</div>
                  </div>
                </div>


              <div class="mt-auto z-10 grid grid-cols-3 gap-2">
                <!-- Video Call -->
                <button 
                  (click)="prepareConsultation(expert)"
                  [disabled]="!expert.isOnline"
                  class="flex flex-col items-center justify-center py-3 rounded-xl transition-all active:scale-95"
                  [class]="expert.isOnline ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-slate-100 text-slate-400 opacity-50'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mb-1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <span class="text-[10px] font-bold">Vídeo</span>
                </button>

                <!-- Schedule -->
                <button 
                  (click)="openSchedule(expert)"
                  class="flex flex-col items-center justify-center py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mb-1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" />
                  </svg>
                  <span class="text-[10px] font-bold">Agendar</span>
                </button>

                <!-- Message -->
                <button 
                  (click)="openMessage(expert)"
                  class="flex flex-col items-center justify-center py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mb-1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                  <span class="text-[10px] font-bold">Chat</span>
                </button>
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
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-6">
           <!-- Backdrop -->
           <div class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" (click)="closePaymentModal()"></div>
           
           <!-- Modal Content -->
           <div class="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-zoom-in">
              
              <!-- Header -->
              <div class="bg-slate-900 p-6 pb-8 text-center text-white relative overflow-hidden">
                 <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent"></div>
                 <h3 class="text-lg font-bold relative z-10">Gateway de Pagamento</h3>
                 <p class="text-slate-400 text-sm font-medium relative z-10 mt-1">Carregar Saldo na Carteira</p>
                 <div class="mt-3 text-4xl font-black text-white relative z-10 tracking-tight">{{ currencyService.formatSimple(5) }}</div>
              </div>
              
              <div class="p-6 -mt-4 bg-white rounded-t-[2rem] relative z-20">
                 
                 <!-- Tabs -->
                 <div class="flex p-1 bg-slate-100 rounded-xl mb-6">
                    <button 
                      (click)="selectedMethod.set('pix')"
                      [class]="selectedMethod() === 'pix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                      class="flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200">
                      PIX
                    </button>
                    <button 
                      (click)="selectedMethod.set('card')"
                      [class]="selectedMethod() === 'card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                      class="flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200">
                      Cartão
                    </button>
                 </div>

                 <!-- ERROR MESSAGE -->
                 @if (errorMessage()) {
                   <div class="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                     </svg>
                     {{ errorMessage() }}
                   </div>
                 }

                 <!-- METHOD: PIX -->
                 @if (selectedMethod() === 'pix') {
                    <div class="text-center animate-in fade-in slide-in-from-right-4 duration-300">
                        <p class="text-sm font-medium text-slate-500 mb-4">
                           Aprovação imediata via Banco Central.
                        </p>
                        
                        <!-- Simulated QR Code -->
                        <div class="bg-white p-2 border border-blue-100 shadow-lg shadow-blue-500/10 rounded-2xl w-40 h-40 mx-auto mb-4 flex items-center justify-center relative group overflow-hidden">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=marcelosilvareisok@gmail.com" 
                                 alt="PIX QR Code" class="w-full h-full mix-blend-multiply opacity-90">
                        </div>

                        <!-- Copy Paste Section -->
                        <div class="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-6 border border-slate-100">
                            <div class="flex-1 truncate font-mono text-xs text-slate-500 font-medium">
                            marcelosilvareisok@gmail.com
                            </div>
                            <button (click)="copyPix()" class="text-blue-600 font-bold text-xs hover:bg-blue-50 px-2 py-1 rounded transition-colors uppercase tracking-wide">Copiar</button>
                        </div>

                        <button 
                          (click)="processPixPayment()" 
                          [disabled]="paymentStatus() === 'processing'"
                          class="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                           @if (paymentStatus() === 'processing') {
                             <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                               <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             A verificar...
                           } @else {
                             Já enviei o PIX
                           }
                        </button>
                    </div>
                 }

                  <!-- METHOD: CREDIT CARD (STRIPE) -->
                  @if (selectedMethod() === 'card') {
                     <div class="text-center py-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div class="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
                          <p class="text-slate-600 font-medium mb-2">Pagamento 100% Seguro</p>
                          <div class="flex items-center justify-center gap-3 opacity-70 grayscale">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" class="h-6">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" class="h-5">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" class="h-6">
                          </div>
                        </div>

                        <button 
                          (click)="processStripePayment()" 
                          [disabled]="paymentStatus() === 'processing'"
                          class="w-full py-4 bg-[#635BFF] hover:bg-[#5851E1] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                            @if (paymentStatus() === 'processing') {
                              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              A redirecionar...
                            } @else {
                              Pagar {{ currencyService.formatSimple(5) }} com Stripe
                            }
                        </button>
                        <p class="text-xs text-slate-400 mt-3 font-medium">Serás redirecionado para a página segura da Stripe.</p>
                     </div>
                  }

                 <button (click)="closePaymentModal()" [disabled]="paymentStatus() === 'processing'" class="w-full py-3 mt-2 text-slate-400 font-bold hover:text-slate-600 text-sm disabled:opacity-50">
                    Cancelar
                 </button>
              </div>
           </div>
        </div>
      }
      <!-- SCHEDULE MODAL -->
      @if (showScheduleModal()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-6">
           <div class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" (click)="showScheduleModal.set(false)"></div>
           <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative animate-zoom-in">
              <h3 class="text-xl font-bold text-slate-900 mb-4">Agendar com {{ selectedExpertForAction()?.name }}</h3>
              
              <div class="space-y-4">
                 <div>
                   <label class="text-sm font-bold text-slate-500 uppercase tracking-wide">Data</label>
                   <div class="flex gap-2 mt-2 overflow-x-auto pb-2">
                     @for (day of ['Hoje', 'Amanhã', 'Seg', 'Ter']; track day) {
                       <button class="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors shrink-0">
                         {{ day }}
                       </button>
                     }
                   </div>
                 </div>

                 <div>
                   <label class="text-sm font-bold text-slate-500 uppercase tracking-wide">Horário</label>
                   <div class="grid grid-cols-3 gap-2 mt-2">
                     @for (time of ['09:00', '10:30', '14:00', '15:30', '17:00']; track time) {
                        <button class="py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors">
                          {{ time }}
                        </button>
                     }
                   </div>
                 </div>
              </div>

              <div class="mt-6 flex gap-3">
                 <button (click)="showScheduleModal.set(false)" class="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancelar</button>
                 <button (click)="confirmSchedule()" class="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg">Confirmar</button>
              </div>
           </div>
        </div>
      }

      <!-- MESSAGE MODAL -->
      @if (showMessageModal()) {
        <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6">
           <div class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" (click)="showMessageModal.set(false)"></div>
           
           <div class="bg-white w-full sm:max-w-md h-[85vh] sm:h-[600px] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col animate-slide-up sm:animate-zoom-in overflow-hidden relative z-10">
              
              <!-- Header -->
              <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-20 shadow-sm">
                 <div class="flex items-center gap-3">
                    <img [src]="selectedExpertForAction()?.avatarUrl" class="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200">
                    <div>
                      <h3 class="font-bold text-slate-900 leading-tight">{{ selectedExpertForAction()?.name }}</h3>
                      <p class="text-xs text-green-500 font-bold flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                      </p>
                    </div>
                 </div>
                 <button (click)="showMessageModal.set(false)" class="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <!-- Chat Area -->
              <div class="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4 relative" (click)="messageInputRef.blur()">
                 <div class="flex justify-center">
                    <span class="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Hoje</span>
                 </div>
                 
                 <div class="flex gap-3 max-w-[90%]">
                    <img [src]="selectedExpertForAction()?.avatarUrl" class="w-8 h-8 rounded-full bg-slate-200 mt-auto border border-white shadow-sm">
                    <div class="bg-white p-3.5 rounded-2xl rounded-bl-none shadow-sm text-sm text-slate-600 leading-relaxed border border-slate-100">
                       Olá! Vi que procuras ajuda em {{ selectedExpertForAction()?.specialties?.[0] }}. Como posso ajudar? Podes enviar áudio ou vídeo.
                    </div>
                 </div>
                 
                 <!-- User Message Mock -->
                 @if (lastSentMessage()) {
                    <div class="flex gap-3 max-w-[90%] ml-auto flex-row-reverse">
                        <img [src]="authService.currentUser()?.avatar" class="w-8 h-8 rounded-full bg-slate-200 mt-auto border border-white shadow-sm">
                        <div class="bg-blue-600 p-3.5 rounded-2xl rounded-br-none shadow-md text-sm text-white leading-relaxed">
                           {{ lastSentMessage() }}
                        </div>
                    </div>
                 }
              </div>

              <!-- Input Area -->
              <div class="p-3 bg-white border-t border-slate-100 pb-safe z-20">
                 <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                    <button class="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50">
                       <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                    <input 
                        #messageInputRef
                        type="text" 
                        [ngModel]="messageInput()"
                        (ngModelChange)="messageInput.set($event)"
                        (keyup.enter)="sendMessage()"
                        placeholder="Mensagem..." 
                        class="flex-1 bg-transparent text-sm outline-none px-2 py-1 text-slate-900 placeholder:text-slate-400 h-10 w-full"
                    >
                    <button 
                        (click)="sendMessage()"
                        [disabled]="!messageInput()"
                        class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-md disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
      // Simulate polling for payment confirmation
      await this.paymentService.verifyPixPayment('mock_tx_id');
      this.finalizeSuccess();
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