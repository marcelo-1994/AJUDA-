import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { AuthService } from '../services/auth.service';
import { ExpertService } from '../services/expert.service';
import { VoiceRecorderService } from '../services/voice-recorder.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F2F2F7] text-slate-900 font-sans selection:bg-blue-500/30 selection:text-blue-900 flex flex-col relative overflow-hidden">
      
      <!-- iOS-style Gradient Background Orbs -->
      <div class="fixed inset-0 pointer-events-none z-0">
        <div class="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-400/20 rounded-full blur-[120px] animate-blob"></div>
        <div class="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-indigo-400/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-purple-400/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <!-- Navbar (Glass) -->
      <nav class="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-black/5 supports-[backdrop-filter]:bg-white/60">
        <div class="text-2xl font-bold tracking-tight flex items-center gap-1 cursor-pointer" (click)="reload()">
            AJUDA<span class="text-blue-500">Í</span>
        </div>
        
        <div class="flex items-center gap-4">
          @if (!authService.isLoggedIn()) {
            <button (click)="initiateGoogleLogin()" aria-label="Entrar na conta" class="text-[15px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Entrar</button>
            <button (click)="initiateGoogleLogin()" aria-label="Criar nova conta" class="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold text-[15px] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              Aceder com Google
            </button>
          } @else {
            <div class="flex items-center gap-3 cursor-pointer group" (click)="toggleProfile()">
               <div class="text-right hidden sm:block">
                 <div class="text-[13px] font-semibold text-slate-900 leading-none">{{ authService.currentUser()?.name }}</div>
                 <div class="text-[11px] text-slate-500 font-medium leading-none mt-1">Saldo: {{ authService.currentUser()?.balance | number:'1.2-2' }}€</div>
               </div>
               <img [src]="authService.currentUser()?.avatar" class="w-9 h-9 rounded-full border border-slate-200 group-hover:border-blue-300 transition-colors">
            </div>
          }
        </div>
      </nav>

      <!-- Main Content -->
      <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center w-full max-w-4xl mx-auto mt-[-40px]">
        
        <!-- Live Indicator Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-full shadow-sm mb-8 animate-fade-in-up">
           <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span class="text-xs font-semibold text-slate-600 tracking-wide">
              <span class="font-bold text-slate-900">{{ onlineCount() }}</span> pessoas e especialistas online
            </span>
        </div>

        <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1] animate-fade-in-up delay-100">
          Problema resolvido.
          <br>
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Num instante.</span>
        </h1>
        
        <p class="text-lg md:text-xl text-slate-500 max-w-lg mx-auto mb-10 font-medium leading-relaxed animate-fade-in-up delay-200">
          Videochamadas de 5 minutos com especialistas. 
          Rápido, seguro e sem complicações.
        </p>

        <!-- iOS Spotlight Search Input -->
        <div class="w-full max-w-2xl relative group z-20 animate-fade-in-up delay-300">
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[2rem] blur opacity-50 group-focus-within:opacity-100 transition duration-500"></div>
          <div class="relative flex items-center bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all duration-300">
            <div class="pl-6 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input 
              type="text" 
              [ngModel]="problemQuery()"
              (ngModelChange)="problemQuery.set($event)"
              (keyup.enter)="analyzeAndSearch()"
              [placeholder]="isRecording() ? 'A ouvir o seu problema...' : 'O que precisas de resolver agora?'" 
              aria-label="Descreva o seu problema para análise"
              class="w-full bg-transparent border-none outline-none py-5 px-4 text-lg font-medium text-slate-900 placeholder:text-slate-400/80 rounded-[2rem]"
            >
            <div class="pr-2 flex items-center gap-2">
              <button 
                (click)="toggleRecording()"
                [class]="isRecording() ? 'bg-red-500 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'"
                aria-label="Gravar áudio"
                class="rounded-full p-3 transition-all duration-300 shadow-sm flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>

              <button 
                (click)="analyzeAndSearch()"
                [disabled]="isAnalyzing() || !problemQuery() || isRecording()"
                aria-label="Analisar problema"
                class="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full p-3 transition-all duration-300 shadow-md hover:scale-105 active:scale-95 flex items-center justify-center">
                @if (isAnalyzing()) {
                  <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                }
              </button>
            </div>
          </div>
        </div>

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
              
              <div class="p-8 text-center border-b border-black/5">
                 <img [src]="authService.currentUser()?.avatar" class="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg object-cover">
                 <h2 class="text-2xl font-bold text-slate-900 tracking-tight">{{ authService.currentUser()?.name }}</h2>
                 <p class="text-slate-500 font-medium">{{ authService.currentUser()?.email }}</p>
                 
                 @if (authService.currentUser()?.isExpert) {
                   <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                     <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                     Especialista Verificado
                   </div>
                 }
                 
                 @if (!authService.currentUser()?.isExpert && authService.currentUser()?.trialMinutesLeft) {
                    <div class="mt-3 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl inline-flex items-center gap-2">
                       <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                       {{ authService.currentUser()?.trialMinutesLeft }} minutos grátis
                    </div>
                 }
              </div>

              <div class="p-4 space-y-3">
                 <button (click)="openReferral()" class="w-full py-4 px-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold flex items-center justify-between shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <span class="flex items-center gap-3">
                       <span class="bg-white/20 p-1.5 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                       Ganhar Comissões
                    </span>
                    <span class="bg-white/20 px-2 py-1 rounded-md text-sm backdrop-blur-sm">{{ authService.currentUser()?.commissionEarned | number:'1.2-2' }}€</span>
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
                   <label class="block text-sm font-semibold text-slate-700 mb-2 ml-1">Preço por Minuto (€)</label>
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

  private router = inject(Router);
  private geminiService = inject(GeminiService);
  public authService = inject(AuthService);
  public expertService = inject(ExpertService);
  public recorderService = inject(VoiceRecorderService);
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
    // Simulate live fluctuation of users
    this.countInterval = setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
      this.onlineCount.update(c => {
        const newVal = c + change;
        return newVal > 45 ? newVal : 45; // Min 45
      });
    }, 4000);
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
      if (this.isRegisterMode()) {
        const user = await this.authService.signUpWithEmail(email, password, name);
        if (user) {
          this.authSuccess.set('Conta criada com sucesso! Verifica o teu email para confirmar.');
          this.authEmail.set('');
          this.authPassword.set('');
          this.authName.set('');
        }
      } else {
        const user = await this.authService.loginWithEmail(email, password);
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
    await this.authService.loginWithGoogle();
    this.showLoginModal.set(false);
  }

  async confirmFacebookLogin() {
    await this.authService.loginWithFacebook();
    this.showLoginModal.set(false);
  }

  toggleProfile() {
    this.showProfileModal.update(v => !v);
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
}