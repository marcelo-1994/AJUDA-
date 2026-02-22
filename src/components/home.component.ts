import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { AuthService } from '../services/auth.service';
import { ExpertService } from '../services/expert.service';
import { VoiceRecorderService } from '../services/voice-recorder.service';
import { CurrencyService } from '../services/currency.service';
import { PaymentGatewayService } from '../services/payment.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade">
      <main>
        <!-- Hero Section -->
      <section class="relative py-12 md:py-20 overflow-hidden rounded-[2.5rem] bg-white shadow-premium border border-black/5 mb-10">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-400/5 rounded-full blur-[120px]"></div>
          <div class="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-indigo-400/5 rounded-full blur-[120px]"></div>
        </div>

        <div class="relative z-10 max-w-3xl mx-auto text-center px-6">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-8 animate-slide">
             <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Ajuda Profissional em Vídeo
          </div>

          <h1 class="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.05] animate-slide delay-100">
            Problema resolvido.<br>
            <span class="text-blue-600">Num instante.</span>
          </h1>
          
          <p class="text-lg md:text-xl text-slate-500 mb-10 font-medium leading-relaxed animate-slide delay-200">
            Conecte-se com especialistas em segundos via videochamada. 
            Simples, direto e sem complicações.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 animate-slide delay-300">
            <button (click)="activateSOS()" 
              class="w-full sm:w-auto px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
              MODO SOS: AGORA
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative group max-w-xl mx-auto animate-slide delay-400">
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-[2rem] blur opacity-40 group-focus-within:opacity-100 transition duration-500"></div>
            <div class="relative flex items-center bg-slate-50 border border-black/5 rounded-[2rem] p-1.5 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-300">
              <div class="pl-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input 
                type="text" 
                [ngModel]="problemQuery()"
                (ngModelChange)="problemQuery.set($event)"
                (keyup.enter)="analyzeAndSearch()"
                [placeholder]="isRecording() ? 'A ouvir...' : 'O que precisas de resolver?'" 
                class="w-full bg-transparent border-none outline-none py-4 px-3 text-lg font-semibold text-slate-900 placeholder:text-slate-400"
              >
              <div class="flex items-center gap-2">
                <button 
                  (click)="toggleRecording()"
                  [class]="isRecording() ? 'bg-red-500 animate-pulse text-white' : 'bg-white text-slate-400 hover:text-blue-600'"
                  class="rounded-xl p-3 shadow-md active:scale-95 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

        <!-- Quick Chips -->
        <div class="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in-up delay-500">
          @for (topic of ['Computador lento', 'Fuga de água', 'Maquilhagem', 'Receita rápida']; track topic) {
            <button 
              (click)="setQuery(topic)"
              class="px-4 py-2 bg-white/60 hover:bg-white border border-black/5 rounded-full text-sm font-medium text-slate-600 shadow-sm transition-all hover:scale-105 active:scale-95">
              {{ topic }}
            </button>
          }
        </div>
      </main>



      <!-- Stories Section -->
      <section class="max-w-4xl mx-auto mb-16 overflow-hidden">
        <div class="flex items-center justify-between px-6 mb-6">
          <h3 class="text-xl font-bold font-display">Histórias de Sucesso</h3>
          <button class="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline transition-all">Ver Tudo</button>
        </div>
        
        <div class="flex gap-4 overflow-x-auto pb-4 px-6 scrollbar-hide">
          <!-- Add Story -->
          <div class="flex flex-col items-center gap-2 min-w-[72px] group">
            <div class="w-[72px] h-[72px] rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-white">
              <span class="text-blue-600 text-2xl font-bold">+</span>
            </div>
            <span class="text-[11px] font-bold text-slate-400">Publicar</span>
          </div>

          @for (story of stories(); track story.name) {
            <div class="flex flex-col items-center gap-2 min-w-[72px] group cursor-pointer transition-transform active:scale-95">
              <div class="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-blue-500 to-indigo-600 group-hover:shadow-lg shadow-blue-500/20 transition-all">
                <div class="w-full h-full rounded-full border-2 border-white overflow-hidden bg-slate-100">
                  <img [src]="story.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                </div>
              </div>
              <span class="text-[11px] font-bold text-slate-600 truncate w-full text-center">{{ story.name }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Community Feed -->
      <section class="max-w-4xl mx-auto px-6 mb-20">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-2xl font-bold font-display tracking-tight text-slate-900">Na Comunidade</h3>
            <p class="text-slate-400 text-sm font-medium">Partilha e ajuda os outros membros</p>
          </div>
        </div>

        <!-- Post Input -->
        @if (authService.isLoggedIn()) {
          <div class="bg-white rounded-3xl p-5 mb-10 shadow-premium border border-black/5 flex items-center gap-4 group focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <img [src]="authService.currentUser()?.avatar" class="w-12 h-12 rounded-2xl object-cover shadow-sm">
            <input 
              type="text" 
              [ngModel]="newPostContent()" 
              (ngModelChange)="newPostContent.set($event)"
              (keyup.enter)="postStatus()"
              placeholder="O que está a pensar?" 
              class="flex-1 bg-transparent border-none outline-none font-medium text-slate-900 placeholder:text-slate-400">
            <button (click)="postStatus()" [disabled]="!newPostContent().trim()" class="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-300 shadow-lg shadow-blue-500/20 transition-all active:scale-90">
               <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        }

        <!-- Feed Posts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (post of feedPosts(); track post.id) {
             <div class="bg-white rounded-3xl p-6 shadow-premium border border-black/5 hover:translate-y-[-4px] transition-all duration-300 group">
                <div class="flex items-center gap-3 mb-6">
                   <div class="relative">
                     <img [src]="post.profiles?.avatar || 'https://i.pravatar.cc/150'" class="w-12 h-12 rounded-2xl object-cover shadow-sm">
                     @if (post.profiles?.is_expert) {
                       <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-lg border-2 border-white flex items-center justify-center">
                         <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                       </div>
                     }
                   </div>
                   <div class="flex-1">
                      <div class="font-bold text-slate-900 text-base">{{ post.profiles?.name || 'Utilizador' }}</div>
                      <div class="text-[10px] text-slate-400 font-black uppercase tracking-widest">{{ post.profiles?.is_expert ? 'Especialista' : 'Membro' }}</div>
                   </div>
                   <button class="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5h.01M12 12h.01M12 19h.01"/></svg>
                   </button>
                </div>
                
                @if (post.image_url) { 
                  <div class="rounded-2xl overflow-hidden mb-5 bg-slate-50 border border-black/5 aspect-video overflow-hidden">
                    <img [src]="post.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                  </div> 
                }
                
                <p class="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                   {{ post.content }}
                </p>

                <div class="flex items-center justify-between pt-5 border-t border-slate-50">
                  <div class="flex items-center gap-6">
                    <button class="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors font-bold text-[11px] uppercase group">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-active:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                       {{ post.likes }}
                    </button>
                    <button class="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors font-bold text-[11px] uppercase">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                       Comentar
                    </button>
                  </div>
                  <button class="text-slate-300 hover:text-blue-600 transition-colors">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  </button>
                </div>
             </div>
          }
        </div>
      </section>

      <!-- Community Features (Optional) -->
      @if (authService.isLoggedIn()) {
        <div class="w-full max-w-4xl mx-auto px-6 mb-12 animate-fade-in-up delay-600">
           <div class="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div class="flex-1 text-center md:text-left">
                 <h3 class="text-2xl font-bold text-slate-900 mb-2">Comunidade AJUDAÍ</h3>
                 <p class="text-slate-500 font-medium font-sm">Decida como quer participar. Quem faz o sistema funcionar é você.</p>
              </div>
              <div class="flex gap-4">
                 <button (click)="toggleCommunity()" [class]="authService.currentUser()?.joinCommunity ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'" class="px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
                    {{ authService.currentUser()?.joinCommunity ? 'Membro Ativo' : 'Aderir à Comunidade' }}
                 </button>
                 <button (click)="openCommunityGroup()" class="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    Ver Grupo
                 </button>
              </div>
           </div>
        </div>
      }

      <!-- Bottom marketing bar -->
      <div class="w-full text-center py-6 pb-4 z-10">
         <div class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 bg-white/40 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm cursor-pointer hover:bg-white/60 transition-colors" (click)="openProviderSignup()">
            <span>💼</span> És especialista? 
            <span class="text-blue-600 font-bold hover:underline">Começa a faturar hoje.</span>
         </div>
      </div>

      <!-- Developer Footer -->
      <footer class="w-full text-center pb-8 z-10 animate-fade-in-up delay-500 pointer-events-none">
         <div class="pointer-events-auto inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-5 py-2.5 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/40 shadow-sm hover:bg-white/80 transition-all">
            <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Dev
                </span>
                <span class="text-xs font-black text-slate-800 tracking-tight">MARCELO DA SILVA REIS</span>
            </div>
            
            <div class="hidden sm:block w-px h-3 bg-slate-300"></div>

            <a href="https://wa.me/5594991233751" target="_blank" class="flex items-center gap-1.5 text-xs text-slate-600 hover:text-green-600 font-bold transition-all hover:scale-105">
               <svg class="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c1.005.548 1.956.817 3.096.817 5.728 0 8.046-5.064 4.706-8.397-1.319-1.318-3.078-2.046-4.953-2.046.008-.021-.044 0-.043 0zM20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.361.101 11.951v.015c0 2.106.549 4.12 1.595 5.92L0 24l6.335-1.652c1.746.947 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.366 11.949-11.959.002-3.155-1.241-6.164-3.48-8.387z"/></svg>
               (94) 99123-3751
            </a>
         </div>
      </footer>

      <!-- 5. Wallet / Deposit Modal -->
      @if (showWalletModal()) {
        <div class="fixed inset-0 z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div class="absolute inset-0 bg-black/60 backdrop-blur-md" (click)="showWalletModal.set(false)"></div>
           
           <div class="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-zoom-in p-8">
              @if (!isPixSuccess()) {
                <div class="text-center">
                  <h2 class="text-2xl font-bold text-slate-900 mb-2">Recarregar Carteira</h2>
                  <p class="text-slate-500 text-sm mb-6">Escolha o valor que deseja depositar para continuar as suas consultas.</p>
                  
                   <div class="grid grid-cols-3 gap-3 mb-6">
                     @for (amount of [5, 10, 20]; track amount) {
                       <button 
                         (click)="selectDeposit(amount)" 
                         [class]="depositAmount() === amount ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'"
                         class="py-3 rounded-2xl border font-bold transition-all active:scale-95">
                         {{ currencyService.formatSimple(amount) }}
                       </button>
                     }
                   </div>

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
 
                   <!-- PIX CONTENT -->
                   @if (selectedMethod() === 'pix') {
                     @if (!isProcessingPix()) {
                       <div class="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100">
                          <div class="bg-white p-3 rounded-xl shadow-sm inline-block mb-3">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=marcelosilvareisok@gmail.com" class="w-24 h-24">
                          </div>
                          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Pagamento via Pix / Instantâneo</p>
                          <button (click)="startPixPayment()" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                             Confirmar Pagamento
                          </button>
                       </div>
                     } @else {
                       <div class="py-12 flex flex-col items-center gap-4">
                          <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          <p class="text-slate-900 font-bold animate-pulse">A confirmar pagamento...</p>
                       </div>
                     }
                   }

                   <!-- STRIPE CONTENT -->
                   @if (selectedMethod() === 'card') {
                      <div class="text-center py-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div class="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
                          <p class="text-slate-600 font-medium mb-2">Pagamento 100% Seguro</p>
                          <div class="flex items-center justify-center gap-3 opacity-70 grayscale">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" class="h-6">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" class="h-5">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" class="h-6">
                          </div>
                        </div>

                        <button 
                          (click)="startStripePayment()" 
                          [disabled]="isProcessingPix()"
                          class="w-full py-4 bg-[#635BFF] hover:bg-[#5851E1] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                            @if (isProcessingPix()) {
                              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              A redirecionar...
                            } @else {
                              Pagar {{ currencyService.formatSimple(depositAmount()) }} com Stripe
                            }
                        </button>
                        <p class="text-xs text-slate-400 mt-3 font-medium">Serás redirecionado para a página segura da Stripe.</p>
                     </div>
                   }
                 </div>
              } @else {
                <div class="text-center py-6 animate-in zoom-in duration-500">
                   <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                   </div>
                   <h2 class="text-3xl font-black text-slate-900 mb-2">Sucesso!</h2>
                   <p class="text-slate-500 font-medium mb-6">Saldo de <span class="text-blue-600 font-bold">{{ currencyService.formatSimple(depositAmount()) }}</span> adicionado.</p>
                   <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-400 text-xs font-bold uppercase tracking-widest">
                      A fechar em {{ pixCountdown() }}s
                   </div>
                </div>
              }
           </div>
        </div>
      }

      <!-- --- MODALS (iOS Sheets) --- -->

      <!-- 1. Login Modal (Email/Password + Social) -->
      @if (showLoginModal()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" (click)="showLoginModal.set(false)"></div>
           
           <div class="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative animate-zoom-in max-h-[90vh] overflow-y-auto">
              <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                 <span class="text-lg font-bold text-slate-800">{{ isRegisterMode() ? 'Criar Conta' : 'Entrar no AJUDAÍ' }}</span>
                 <button (click)="showLoginModal.set(false)" class="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div class="p-8 pt-6">
                 <p class="text-sm text-gray-600 mb-6 text-center">{{ isRegisterMode() ? 'Cria a tua conta para começar.' : 'Conecta-te para resolver problemas num instante.' }}</p>
                 
                 <!-- Email/Password Form -->
                 <form (ngSubmit)="submitEmailAuth()" class="space-y-4 mb-6">
                    @if (isRegisterMode()) {
                      <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Nome</label>
                        <input type="text" [ngModel]="authName()" (ngModelChange)="authName.set($event)" name="name" placeholder="O teu nome" class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all">
                      </div>
                    }
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
                      <input type="email" [ngModel]="authEmail()" (ngModelChange)="authEmail.set($event)" name="email" placeholder="nome@exemplo.com" required class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all">
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Senha</label>
                      <input type="password" [ngModel]="authPassword()" (ngModelChange)="authPassword.set($event)" name="password" placeholder="Mínimo 6 caracteres" required class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all">
                    </div>

                    @if (authError()) {
                      <div class="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-xl text-center">
                        {{ authError() }}
                      </div>
                    }

                    @if (authSuccess()) {
                      <div class="bg-green-50 border border-green-200 text-green-600 text-sm font-medium p-3 rounded-xl text-center">
                        {{ authSuccess() }}
                      </div>
                    }

                    <button type="submit" [disabled]="authLoading()" class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2">
                      @if (authLoading()) {
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        A processar...
                      } @else {
                        {{ isRegisterMode() ? 'Criar Conta' : 'Entrar' }}
                      }
                    </button>
                 </form>

                 <!-- Toggle Login/Register -->
                 <p class="text-sm text-center text-slate-500 mb-6">
                   {{ isRegisterMode() ? 'Já tens conta?' : 'Não tens conta?' }}
                   <button (click)="toggleAuthMode()" class="text-blue-600 font-bold hover:underline ml-1">
                     {{ isRegisterMode() ? 'Entrar' : 'Criar conta' }}
                   </button>
                 </p>

                 <!-- Divider -->
                 <div class="flex items-center gap-3 mb-6">
                   <div class="flex-1 h-px bg-slate-200"></div>
                   <span class="text-xs text-slate-400 font-medium uppercase tracking-wide">ou</span>
                   <div class="flex-1 h-px bg-slate-200"></div>
                 </div>

                 <!-- Google Button -->
                 <div (click)="confirmGoogleLogin()" class="flex items-center gap-4 p-4 border border-gray-200 hover:bg-gray-50 cursor-pointer rounded-xl transition-all group mb-3 shadow-sm hover:shadow-md">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" class="h-6">
                    <div class="flex-1 font-semibold text-gray-700">Continuar com Google</div>
                 </div>

                 <!-- Facebook Button -->
                 <div (click)="confirmFacebookLogin()" class="flex items-center gap-4 p-4 bg-[#1877F2] hover:bg-[#166fe5] cursor-pointer rounded-xl transition-all group shadow-sm hover:shadow-md hover:scale-[1.01]">
                    <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <div class="flex-1 font-semibold text-white">Continuar com Facebook</div>
                 </div>
                 
                 <p class="text-xs text-gray-400 mt-6 text-center">Ao entrar, aceitas os nossos termos.</p>
              </div>
           </div>
        </div>
      }

      <!-- 2. Profile Modal -->
      @if (showProfileModal()) {
        <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
           <!-- Backdrop -->
           <div class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" (click)="showProfileModal.set(false)"></div>
           
           <!-- Sheet content -->
           <div class="bg-white/90 backdrop-blur-2xl w-full sm:w-[400px] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden relative animate-slide-up sm:animate-zoom-in">
              <div class="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-5 sm:hidden"></div>
              
              <div class="p-8 text-center border-b border-black/5 bg-gradient-to-b from-slate-50 to-white">
                 <div class="relative w-24 h-24 mx-auto mb-4 group">
                    <img [src]="authService.currentUser()?.avatar" class="w-24 h-24 rounded-full shadow-lg object-cover border-2 border-white">
                    <label class="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                       <input type="file" class="hidden" (change)="onAvatarSelected($event)">
                       @if (isUploadingAvatar()) {
                         <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       } @else {
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       }
                    </label>
                 </div>

                 <input 
                   type="text" 
                   [(ngModel)]="userName" 
                   (blur)="updateName()"
                   class="text-xl font-black text-slate-900 text-center w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/10 rounded-lg py-1 px-4 mb-1"
                   placeholder="Seu Nome">
                 
                 <textarea 
                   [(ngModel)]="userBio" 
                   (blur)="updateBio()"
                   class="text-slate-500 font-medium text-sm text-center w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/10 rounded-lg py-1 px-4 resize-none h-16 mb-4"
                   placeholder="Escreva algo sobre si..."></textarea>
                 
                 <div class="flex items-center justify-center gap-3">
                    @if (authService.currentUser()?.isExpert) {
                      <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                        Especialista Verificado
                      </div>
                    }
                    
                    @if (authService.currentUser()?.trialMinutesLeft) {
                       <div class="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          {{ authService.currentUser()?.trialMinutesLeft }}m Grátis
                       </div>
                    }
                 </div>
              </div>

              <div class="p-4 space-y-4">
                 <!-- Appearance Settings -->
                 <div class="px-2">
                    <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Aparência & Layout</h4>
                    <div class="flex items-center justify-between mb-4">
                       <span class="text-sm font-semibold text-slate-700">Modo Escuro</span>
                       <button (click)="toggleTheme()" 
                               [class.bg-blue-600]="authService.currentUser()?.theme === 'dark'"
                               [class.bg-slate-200]="authService.currentUser()?.theme !== 'dark'"
                               class="w-12 h-6 rounded-full relative transition-colors">
                          <div [class.translate-x-6]="authService.currentUser()?.theme === 'dark'"
                               [class.translate-x-1]="authService.currentUser()?.theme !== 'dark'"
                               class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"></div>
                       </button>
                    </div>

                    <div class="flex items-center justify-between">
                       <span class="text-sm font-semibold text-slate-700">Cor Primária</span>
                       <div class="flex gap-2">
                          @for (color of ['#2563eb', '#db2777', '#059669', '#7c3aed']; track color) {
                            <button (click)="updateColor(color)" 
                                    [style.backgroundColor]="color"
                                    [class.ring-2]="authService.currentUser()?.primaryColor === color"
                                    class="w-6 h-6 rounded-full ring-offset-2 ring-slate-300 transition-all active:scale-90"></button>
                          }
                       </div>
                    </div>
                 </div>
                 
                 <div class="h-px bg-slate-100 mx-2"></div>
                 <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Seu Link de Chamada Personalizado</h4>
                    <div class="flex items-center gap-2 bg-white rounded-xl p-3 border border-blue-200">
                       <input readonly [value]="authService.currentUser()?.personalizedCallLink" class="bg-transparent text-[13px] font-mono text-slate-600 w-full outline-none">
                       <button (click)="copyCallLink()" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
                       </button>
                    </div>
                    <p class="text-[10px] text-blue-500 mt-2 font-medium">Partilhe este link para que outros se possam ligar a si instantaneamente.</p>
                 </div>

                 <button (click)="openReferral()" class="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between transition-all group">
                    <span class="flex items-center gap-3">
                       <span class="bg-white/20 p-1.5 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                       Ganhar Comissões
                    </span>
                    <span class="bg-white/20 px-2 py-1 rounded-md text-sm backdrop-blur-sm">{{ currencyService.formatSimple(authService.currentUser()?.commissionEarned || 0) }}</span>
                 </button>

                 <button (click)="openPlans()" class="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between transition-all group mt-3">
                    <span class="flex items-center gap-3">
                       <span class="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                       </span>
                       Planos & Assinaturas
                    </span>
                    <span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold uppercase border border-indigo-200">{{ authService.currentUser()?.plan || 'Free' }}</span>
                 </button>

                 @if (!authService.currentUser()?.isExpert) {
                   <button (click)="openProviderSignup()" class="w-full py-4 px-5 bg-slate-100 text-slate-700 rounded-2xl font-semibold text-left hover:bg-slate-200 transition-colors flex items-center gap-3">
                      <span class="bg-white p-1.5 rounded-lg shadow-sm text-slate-400">💼</span>
                      Tornar-me Especialista
                   </button>
                 }

                 <button (click)="authService.logout(); showProfileModal.set(false)" class="w-full py-4 px-5 text-red-500 hover:bg-red-50 rounded-2xl font-semibold text-left transition-colors flex items-center gap-3">
                    <span class="bg-red-50 p-1.5 rounded-lg text-red-400">🚪</span>
                    Sair da Conta
                 </button>
              </div>
              <div class="p-4 pt-0">
                 <button (click)="showProfileModal.set(false)" class="w-full py-3 text-slate-400 font-medium hover:text-slate-600">Cancelar</button>
              </div>
           </div>
        </div>
      }

      <!-- 3. Referral Modal -->
      @if (showReferralModal()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-6">
           <div class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" (click)="showReferralModal.set(false)"></div>
           
           <div class="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-zoom-in p-8 text-center">
              <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              
              <h2 class="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Convida & Ganha</h2>
              <p class="text-xs text-blue-600 font-bold uppercase tracking-wide mb-3">Algoritmo Inteligente Ativo</p>
              
              <p class="text-slate-500 font-medium leading-relaxed mb-6">
                O nosso sistema recompensa quem partilha mais. Ganha <span class="text-green-600 font-bold">5% de comissão</span> vitalícia.
              </p>
              
              <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 relative group cursor-pointer" (click)="shareOnWhatsApp()">
                 <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">O teu link exclusivo</p>
                 <p class="text-blue-600 font-mono font-semibold truncate text-sm">ajudai.com/?ref={{ authService.currentUser()?.referralCode || 'GUEST' }}</p>
              </div>

              <div class="space-y-3">
                <button (click)="shareOnWhatsApp()" class="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/20 active:scale-95">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c1.005.548 1.956.817 3.096.817 5.728 0 8.046-5.064 4.706-8.397-1.319-1.318-3.078-2.046-4.953-2.046.008-.021-.044 0-.043 0zM20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.361.101 11.951v.015c0 2.106.549 4.12 1.595 5.92L0 24l6.335-1.652c1.746.947 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.366 11.949-11.959.002-3.155-1.241-6.164-3.48-8.387z"/></svg>
                  Partilhar no WhatsApp
                </button>

                <button (click)="shareOnFacebook()" class="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Partilhar no Facebook
                </button>
              </div>
              
              <button (click)="showReferralModal.set(false)" class="mt-6 text-sm text-slate-400 font-medium hover:text-slate-600">Agora não</button>
           </div>
        </div>
      }

      <!-- 4. Provider Signup Modal (Progressive Profiling) -->
      @if (showProviderModal()) {
         <div class="fixed inset-0 z-[60] flex items-center justify-center p-6">
           <div class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" (click)="showProviderModal.set(false)"></div>
           
           <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-zoom-in p-8 max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-center mb-6">
                 <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Registo de Especialista</h2>
                 <button (click)="showProviderModal.set(false)" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">✕</button>
              </div>
              
              <form [formGroup]="providerForm" (ngSubmit)="submitProvider()" class="space-y-5">
                 
                 <div>
                   <label class="block text-sm font-semibold text-slate-700 mb-2 ml-1">A tua Especialidade</label>
                   <div class="relative">
                     <select 
                        #catSelect
                        formControlName="category" 
                        (change)="checkCustomCategory($event)"
                        class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none font-medium text-slate-900 transition-all">
                       @for (cat of expertService.getCategories()(); track cat) {
                         <option [value]="cat">{{ cat }}</option>
                       }
                       <option value="__custom__">Outra / Personalizada...</option>
                     </select>
                     <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                   </div>

                   <!-- CUSTOM CATEGORY INPUT -->
                   @if (isCustomCategory()) {
                     <div class="mt-3 animate-in slide-in-from-top-2">
                       <input 
                          type="text" 
                          formControlName="customCategory"
                          placeholder="Digite a sua especialidade..." 
                          class="w-full p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-medium placeholder:text-blue-300">
                     </div>
                   }
                 </div>

                 <!-- NEW FIELDS: Phone & Address -->
                 <div>
                   <label class="block text-sm font-semibold text-slate-700 mb-2 ml-1">Telefone</label>
                   <input type="tel" formControlName="phone" placeholder="Ex: (00) 00000-0000" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all">
                   @if(providerForm.get('phone')?.touched && providerForm.get('phone')?.invalid) {
                     <p class="text-xs text-red-500 mt-1 ml-1 font-medium">Telefone inválido (mínimo 9 dígitos)</p>
                   }
                 </div>

                 <div>
                   <label class="block text-sm font-semibold text-slate-700 mb-2 ml-1">Endereço</label>
                   <input type="text" formControlName="address" placeholder="Rua, Número, Cidade" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all">
                   @if(providerForm.get('address')?.touched && providerForm.get('address')?.invalid) {
                     <p class="text-xs text-red-500 mt-1 ml-1 font-medium">Endereço é obrigatório</p>
                   }
                 </div>

                 <div>
                   <label class="block text-sm font-semibold text-slate-700 mb-2 ml-1">Preço por Minuto ({{ currencyService.currencyConfig().symbol }})</label>
                   <input type="number" formControlName="price" placeholder="Ex: 1.50" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all">
                 </div>

                 <!-- PIX KEY INPUT (CRITICAL) -->
                 <div class="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <label class="block text-sm font-bold text-blue-900 mb-2">Chave PIX (Para receberes)</label>
                    <div class="flex items-center gap-2 mb-3 bg-white/60 p-2 rounded-lg w-fit">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                       </svg>
                       <span class="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Encriptada & Segura</span>
                    </div>
                    <input type="text" formControlName="pixKey" placeholder="CPF, Email, ou Telefone" class="w-full p-4 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-mono text-sm shadow-sm">
                    <p class="text-xs text-blue-500 mt-3 font-medium leading-relaxed">
                       O valor das tuas consultas será transferido automaticamente para esta chave.
                    </p>
                 </div>

                 <button type="submit" [disabled]="!providerForm.valid" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10 active:scale-95 mt-2">
                    Concluir Registo
                 </button>
              </form>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 15s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-500 { animation-delay: 500ms; }

    @keyframes zoom-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-zoom-in {
      animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  problemQuery = signal('');
  isAnalyzing = signal(false);

  // Live User Stats
  onlineCount = signal(52);
  private countInterval: any;

  // Modals state
  showLoginModal = signal(false);
  showProfileModal = signal(false);
  showReferralModal = signal(false);
  showProviderModal = signal(false);
  showWalletModal = signal(false);

  // Deposit state
  depositAmount = signal(10);
  selectedMethod = signal<'pix' | 'card'>('pix');
  isProcessingPix = signal(false);
  isPixSuccess = signal(false);
  pixCountdown = signal(3);

  // Email/Password Auth state
  isRegisterMode = signal(false);
  authEmail = signal('');
  authPassword = signal('');
  authName = signal('');
  authLoading = signal(false);
  authError = signal('');
  authSuccess = signal('');

  // Custom Category Logic
  isCustomCategory = signal(false);

  // Social Feed Data
  stories = signal<any[]>([]);
  feedPosts = signal<any[]>([]);
  newPostContent = signal('');
  isUploadingAvatar = signal(false);
  userName = signal('');
  userBio = signal('');

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private geminiService = inject(GeminiService);
  public authService = inject(AuthService);
  public expertService = inject(ExpertService);
  public recorderService = inject(VoiceRecorderService);
  public currencyService = inject(CurrencyService);
  private paymentService = inject(PaymentGatewayService);
  private fb: FormBuilder = inject(FormBuilder);

  isRecording = this.recorderService.isRecording;

  // Forms
  providerForm: FormGroup = this.fb.group({
    category: ['Bricolage', Validators.required],
    customCategory: [''], // Optional
    price: [1.50, [Validators.required, Validators.min(0.5)]],
    pixKey: ['', [Validators.required, Validators.minLength(5)]],
    phone: ['', [Validators.required, Validators.minLength(9)]],
    address: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit() {
    // Check for SOS or Referral params
    this.route.queryParams.subscribe(params => {
      if (params['ref']) {
        console.log('Referral code detected:', params['ref']);
        localStorage.setItem('ajudai_pending_ref', params['ref']);
      }

      if (params['sos'] === 'true' || this.router.url.includes('/sos')) {
        this.problemQuery.set('AJUDA URGENTE: SOLICITAÇÃO SOS');
      }

      if (params['openWallet'] === 'true') {
        this.showWalletModal.set(true);
      }
    });

    // Populate profile signals
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(user.name);
      this.userBio.set(user.bio || '');
    }

    // Load Social Feed
    this.loadFeed();


  }

  ngOnDestroy() {
    if (this.countInterval) clearInterval(this.countInterval);
  }

  reload() {
    window.location.reload();
  }

  setQuery(text: string) {
    this.problemQuery.set(text);
  }

  async activateSOS() {
    this.problemQuery.set('Urgência Total: Preciso de ajuda agora!');
    await this.analyzeAndSearch();
  }

  async analyzeAndSearch() {
    if (!this.problemQuery().trim()) return;

    this.isAnalyzing.set(true);
    const analysis = await this.geminiService.analyzeProblem(this.problemQuery());
    this.isAnalyzing.set(false);

    this.router.navigate(['/results'], {
      queryParams: {
        q: this.problemQuery(),
        category: analysis?.category || 'Outros',
        tip: analysis?.quickTip || '',
        score: analysis?.matchScore || 0
      }
    });
  }

  async toggleRecording() {
    if (this.isRecording()) {
      const audioBlob = await this.recorderService.stopRecording();
      this.analyzeVoice(audioBlob);
    } else {
      try {
        await this.recorderService.startRecording();
      } catch (err) {
        alert('Não foi possível aceder ao microfone. Verifique as permissões.');
      }
    }
  }

  async analyzeVoice(blob: Blob) {
    this.isAnalyzing.set(true);
    try {
      const analysis = await this.geminiService.analyzeVoiceProblem(blob);
      if (analysis) {
        this.problemQuery.set(analysis.transcription || '');
        this.router.navigate(['/results'], {
          queryParams: {
            q: analysis.transcription || 'Pedido de voz',
            category: analysis.category || 'Outros',
            tip: analysis.quickTip || '',
            score: analysis.matchScore || 0
          }
        });
      }
    } catch (err) {
      console.error('Error analyzing voice:', err);
    } finally {
      this.isAnalyzing.set(false);
    }
  }



  // --- Auth & Actions ---

  initiateGoogleLogin() {
    this.authError.set('');
    this.authSuccess.set('');
    this.showLoginModal.set(true);
  }

  toggleAuthMode() {
    this.isRegisterMode.update(v => !v);
    this.authError.set('');
    this.authSuccess.set('');
  }

  async submitEmailAuth() {
    const email = this.authEmail().trim();
    const password = this.authPassword().trim();
    const name = this.authName().trim();

    if (!email || !password) {
      this.authError.set('Preenche o email e a senha.');
      return;
    }
    if (password.length < 6) {
      this.authError.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.authLoading.set(true);
    this.authError.set('');
    this.authSuccess.set('');

    try {
      const ref = localStorage.getItem('ajudai_pending_ref') || undefined;

      if (this.isRegisterMode()) {
        const user = await this.authService.signUpWithEmail(email, password, name, ref);
        if (user) {
          this.authSuccess.set('Conta criada com sucesso! Verifica o teu email para confirmar.');
          this.authEmail.set('');
          this.authPassword.set('');
          this.authName.set('');
        }
      } else {
        const user = await this.authService.loginWithEmail(email, password, ref);
        if (user) {
          this.showLoginModal.set(false);
          this.authEmail.set('');
          this.authPassword.set('');
        }
      }
    } catch (error: any) {
      this.authError.set(error?.message || 'Erro ao processar. Tenta novamente.');
    }

    this.authLoading.set(false);
  }

  async confirmGoogleLogin() {
    try {
      this.authLoading.set(true);
      await this.authService.loginWithGoogle();
      // O redirect vai acontecer aqui.
    } catch (error: any) {
      this.authError.set(error?.message || 'Erro ao conectar com Google.');
      this.authLoading.set(false);
    }
  }

  async confirmFacebookLogin() {
    try {
      this.authLoading.set(true);
      await this.authService.loginWithFacebook();
      // O redirect vai acontecer aqui.
    } catch (error: any) {
      this.authError.set(error?.message || 'Erro ao conectar com Facebook.');
      this.authLoading.set(false);
    }
  }

  toggleProfile() {
    this.showProfileModal.update(v => !v);
  }

  copyCallLink() {
    const link = this.authService.currentUser()?.personalizedCallLink;
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Link de chamada copiado!');
    }
  }

  openReferral() {
    if (!this.authService.isLoggedIn()) {
      this.initiateGoogleLogin();
    }
    this.showProfileModal.set(false);
    this.showReferralModal.set(true);
  }

  shareOnWhatsApp() {
    const code = this.authService.currentUser()?.referralCode || 'FRIEND';
    const text = `Hey! Descobri o AJUDAÍ, uma app top para resolver problemas rápidos por vídeo. Usa o meu link: https://ajudai.com/?ref=${code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  shareOnFacebook() {
    const code = this.authService.currentUser()?.referralCode || 'FRIEND';
    const url = `https://ajudai.com/?ref=${code}`;
    // Uses Facebook Sharer URL (doesn't require SDK)
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  }

  openProviderSignup() {
    if (!this.authService.isLoggedIn()) {
      this.initiateGoogleLogin();
    }
    this.showProfileModal.set(false);
    this.showProviderModal.set(true);
  }

  checkCustomCategory(event: any) {
    const value = event.target.value;
    if (value === '__custom__') {
      this.isCustomCategory.set(true);
      this.providerForm.get('customCategory')?.setValidators([Validators.required]);
    } else {
      this.isCustomCategory.set(false);
      this.providerForm.get('customCategory')?.clearValidators();
    }
    this.providerForm.get('customCategory')?.updateValueAndValidity();
  }

  submitProvider() {
    if (this.providerForm.valid) {
      let { category, customCategory, price, pixKey, phone, address } = this.providerForm.value;
      const user = this.authService.currentUser();

      // Use Custom Category if selected
      if (category === '__custom__') {
        category = customCategory;
      }

      this.authService.becomeExpert(category, price, pixKey, phone, address);

      // Add to service list immediately for demo
      if (user) {
        this.expertService.addNewExpert({
          id: user.id,
          name: user.name,
          category: category,
          rating: 5.0, // Newbie boost
          reviews: 0,
          pricePerMin: Math.round(price * 100),
          isOnline: true,
          avatarUrl: user.avatar,
          specialties: ['Geral', category]
        });
      }

      this.showProviderModal.set(false);
      alert(`Parabéns! O teu perfil de especialista em "${category}" está ativo.`);
    }
  }

  async toggleCommunity() {
    const currentStatus = this.authService.currentUser()?.joinCommunity;
    await this.authService.updateProfile({ joinCommunity: !currentStatus });
  }

  openCommunityGroup() {
    window.open('https://chat.whatsapp.com/CilC3a21huq0vtw4DWMkw4?mode=gi_t', '_blank');
  }

  // --- Wallet / Deposit Logic ---

  openWallet() {
    this.showProfileModal.set(false);
    this.showWalletModal.set(true);
    this.isPixSuccess.set(false);
    this.isProcessingPix.set(false);
  }

  selectDeposit(amount: number) {
    this.depositAmount.set(amount);
  }

  async startStripePayment() {
    const user = this.authService.currentUser();
    if (!user) {
      this.initiateGoogleLogin();
      return;
    }

    this.isProcessingPix.set(true); // Reusing processing state for loading
    try {
      const checkoutUrl = await this.paymentService.createStripeCheckout(
        this.depositAmount(),
        user.id,
        this.currencyService.code || 'eur'
      );

      // Redirect to Stripe
      window.location.href = checkoutUrl;
    } catch (err: any) {
      alert(err.message || 'Erro ao iniciar pagamento.');
      this.isProcessingPix.set(false);
    }
  }

  async startPixPayment() {
    alert('Funcionalidade PIX real em manutenção. Por favor, utilize Cartão via Stripe.');
  }

  async finishDeposit() {
    // Webhook handle
  }

  openPlans() {
    this.showProfileModal.set(false);
    this.router.navigate(['/plans']);
  }
  async loadFeed() {
    const { data } = await this.authService['supabaseService'].getPosts();
    if (data) {
      this.feedPosts.set(data);
    }
  }

  async postStatus() {
    const content = this.newPostContent().trim();
    const user = this.authService.currentUser();
    if (!content || !user) return;

    const { data } = await this.authService['supabaseService'].createPost({
      content,
      profile_id: user.id
    });

    if (data) {
      this.newPostContent.set('');
      this.loadFeed();
    }
  }

  async onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploadingAvatar.set(true);
    const url = await this.authService.uploadAvatar(file);
    if (url) {
      alert('Foto de perfil atualizada!');
    }
    this.isUploadingAvatar.set(false);
  }

  updateName() {
    if (this.userName().trim()) {
      this.authService.updateProfile({ name: this.userName().trim() });
    }
  }

  updateBio() {
    this.authService.updateProfile({ bio: this.userBio().trim() });
  }

  toggleTheme() {
    const current = this.authService.currentUser()?.theme || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    this.authService.updateProfile({ theme: next });
  }

  updateColor(color: string) {
    this.authService.updateProfile({ primaryColor: color });
  }

}