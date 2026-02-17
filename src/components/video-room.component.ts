import { Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpertService, Expert } from '../services/expert.service';
import { AuthService } from '../services/auth.service';

interface ChatMessage {
  sender: 'me' | 'expert';
  text: string;
  time: Date;
}

@Component({
  selector: 'app-video-room',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }
    .animate-pulse-ring {
      animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .animate-spin-slow {
      animation: spin 8s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    /* iOS Blur Scrollbar */
    .chat-scroll::-webkit-scrollbar { width: 4px; }
    .chat-scroll::-webkit-scrollbar-track { background: transparent; }
    .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 20px; }
  `],
  template: `
    <div class="fixed inset-0 bg-slate-900 flex flex-col font-sans overflow-hidden">
      
      <!-- Top Dynamic Island / Header -->
      <div class="absolute top-0 left-0 right-0 p-4 z-30 flex justify-between items-start pointer-events-none">
        
        <!-- Timer & Cost (Dynamic Island Style) -->
        <div class="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-1.5 pr-5 flex items-center gap-3 shadow-2xl transition-all hover:bg-black/50">
           
           @if (isFreeMode()) {
              <!-- FREE MODE BADGE -->
              <div class="bg-amber-400 w-8 h-8 rounded-full flex items-center justify-center relative shadow-lg shadow-amber-500/50">
                <div class="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-50"></div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-amber-900 relative z-10">
                  <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-white font-mono font-bold text-sm leading-none">{{ formattedTime() }}</span>
                <span class="text-amber-400 text-[10px] font-bold uppercase tracking-wider leading-none mt-1">MODO GRÁTIS</span>
              </div>
           } @else {
             <!-- PAID MODE BADGE -->
             <div class="bg-red-500/90 w-8 h-8 rounded-full flex items-center justify-center relative">
               <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white relative z-10">
                 <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
               </svg>
             </div>
             <div class="flex flex-col">
               <span class="text-white font-mono font-bold text-sm leading-none">{{ formattedTime() }}</span>
               <span class="text-emerald-400 text-[10px] font-bold uppercase tracking-wider leading-none mt-1">{{ currentCost() | number:'1.2-2' }}€</span>
             </div>
           }
        </div>
        
        <!-- Expert Badge -->
        <div class="pointer-events-auto bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
           @if (expert()) {
            <div class="text-right">
              <h2 class="text-white font-bold text-xs leading-tight">{{ expert()!.name }}</h2>
              <p class="text-slate-300 text-[10px] opacity-80">{{ expert()!.category }}</p>
            </div>
            <img [src]="expert()!.avatarUrl" class="w-8 h-8 rounded-full border border-white/20">
           }
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 relative flex items-center justify-center">
        
        <!-- Background Ambient -->
        <div class="absolute inset-0 z-0 select-none pointer-events-none">
          <img src="https://picsum.photos/seed/workspace/1920/1080" class="w-full h-full object-cover opacity-30 filter blur-3xl scale-110" alt="Background">
          <div class="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90"></div>
        </div>

        <!-- Connection Status / Expert Avatar Pulse -->
        @if (expert()) {
          <div class="z-10 flex flex-col items-center justify-center relative animate-in zoom-in duration-500">
             <!-- Animated Rings -->
             <div class="absolute w-64 h-64 border border-blue-500/30 rounded-full animate-pulse-ring"></div>
             <div class="absolute w-64 h-64 border border-blue-400/20 rounded-full animate-pulse-ring" style="animation-delay: 1s;"></div>
             
             <div class="relative group cursor-pointer">
               <div class="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur opacity-75 animate-spin-slow"></div>
               <img [src]="expert()!.avatarUrl" class="relative w-40 h-40 rounded-full border-4 border-slate-900 shadow-2xl object-cover z-10">
             </div>

             <div class="mt-8 text-center space-y-2 relative z-20">
               <h3 class="text-2xl font-bold text-white tracking-tight">A ligar...</h3>
               <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                 <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                 <span class="text-xs font-medium text-white">Encriptado ponta-a-ponta</span>
               </div>
             </div>
          </div>
        }
      </div>

      <!-- Chat Overlay (Glass Panel) -->
      @if (isChatOpen()) {
        <div class="absolute inset-x-4 top-28 bottom-36 md:right-4 md:left-auto md:w-80 md:bottom-28 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col shadow-2xl z-40 animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 duration-300">
          
          <!-- Header -->
          <div class="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-[2rem]">
            <span class="text-white font-bold text-sm tracking-wide">Chat</span>
            <button (click)="toggleChat()" class="bg-white/10 p-1.5 rounded-full text-white hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Messages -->
          <div #chatContainer class="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
             @if (messages().length === 0) {
               <div class="h-full flex flex-col items-center justify-center text-center opacity-40">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mb-2 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                 </svg>
                 <p class="text-white text-xs font-medium">Envia mensagens de texto<br>se a ligação falhar.</p>
               </div>
             }
             @for (msg of messages(); track msg) {
               <div [class]="msg.sender === 'me' ? 'flex justify-end' : 'flex justify-start'">
                 <div [class]="msg.sender === 'me' ? 'bg-blue-600 text-white rounded-[1.2rem] rounded-br-sm' : 'bg-white/10 text-white rounded-[1.2rem] rounded-bl-sm'" 
                      class="max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm backdrop-blur-sm">
                   {{ msg.text }}
                 </div>
               </div>
             }
          </div>

          <!-- Input -->
          <div class="p-3 bg-white/5 rounded-b-[2rem]">
             <div class="relative flex items-center bg-black/30 rounded-full border border-white/5 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
               <input 
                 #chatInput
                 [value]="currentMessage()" 
                 (input)="currentMessage.set(chatInput.value)" 
                 (keyup.enter)="sendMessage()"
                 type="text" 
                 placeholder="Mensagem..." 
                 class="w-full bg-transparent text-white pl-4 pr-12 py-3 text-sm placeholder:text-slate-500 focus:outline-none">
               <button 
                (click)="sendMessage()" 
                [disabled]="!currentMessage()"
                class="absolute right-1.5 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-0 transition-all scale-90 hover:scale-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
               </button>
             </div>
          </div>
        </div>
      }

      <!-- Self View (PIP) -->
      <div class="absolute bottom-32 right-6 w-32 h-48 md:w-40 md:h-60 bg-black/80 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-30 transition-all hover:scale-105">
        <video #selfVideo autoplay muted playsinline class="w-full h-full object-cover transform scale-x-[-1]"></video>
        @if (!cameraEnabled()) {
           <div class="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
             <div class="bg-white/10 p-2 rounded-full">
               <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
             </div>
           </div>
        }
      </div>

      <!-- Bottom Controls (Glass Dock) -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/30 backdrop-blur-2xl px-6 py-4 rounded-[2.5rem] border border-white/10 shadow-2xl z-30 animate-in slide-in-from-bottom-20">
        
        <!-- Toggle Mic -->
        <button (click)="toggleMic()" 
           [class]="micEnabled() ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black'"
           class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
           title="Microfone">
           @if (micEnabled()) {
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>
           } @else {
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>
           }
        </button>

        <!-- Toggle Camera -->
        <button (click)="toggleCamera()" 
           [class]="cameraEnabled() ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black'"
           class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
           title="Câmera">
           @if (cameraEnabled()) {
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
           } @else {
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" /></svg>
           }
        </button>

        <!-- Toggle Chat -->
        <button (click)="toggleChat()" 
           [class]="isChatOpen() ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'"
           class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 relative"
           title="Chat">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>
           @if (messages().length > 0 && !isChatOpen()) {
             <span class="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce"></span>
           }
        </button>

        <!-- End Call -->
        <button (click)="promptEndCall()" 
           class="w-20 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg shadow-red-500/30 active:scale-95">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
        </button>
      </div>

      <!-- End Call Confirmation Modal -->
      @if (showEndConfirmation()) {
        <div class="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300">
              <h2 class="text-xl font-bold text-slate-900 mb-2">Terminar chamada?</h2>
              <p class="text-slate-500 font-medium text-sm mb-6">A cobrança será calculada com base no tempo atual.</p>
              
              <div class="flex gap-3">
                 <button (click)="cancelEndCall()" class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    Cancelar
                 </button>
                 <button (click)="confirmEndCall()" class="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">
                    Terminar
                 </button>
              </div>
           </div>
        </div>
      }

      <!-- Receipt Modal (Apple Sheet Style) -->
      @if (showReceipt()) {
        <div class="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-green-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 mb-1">Pagamento Concluído</h2>
              <p class="text-slate-500 font-medium text-sm mb-6">A micro-consulta foi encerrada.</p>
              
              <div class="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3">
                 <div class="flex justify-between text-sm">
                   <span class="text-slate-500">Duração</span>
                   <span class="font-bold text-slate-900">{{ formattedTime() }}</span>
                 </div>
                 
                 <!-- Detailed Breakdown -->
                 @if (finalReceipt()?.minutesUsed && finalReceipt()?.minutesUsed > 0) {
                   <div class="flex justify-between text-sm text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                     <span>Minutos Grátis Usados</span>
                     <span class="font-bold">- {{ finalReceipt()?.minutesUsed }}m</span>
                   </div>
                 }
                 
                 <div class="flex justify-between text-sm">
                   <span class="text-slate-500">Taxa / min</span>
                   <span class="font-bold text-slate-900">{{ (expert()?.pricePerMin || 0) / 100 | number:'1.2-2' }}€</span>
                 </div>
                 
                 <div class="border-t border-slate-200 my-2"></div>
                 
                 <div class="flex justify-between items-center">
                   <span class="text-slate-900 font-bold">Total Pago</span>
                   <span class="text-xl font-black text-slate-900">{{ finalReceipt()?.cost | number:'1.2-2' }}€</span>
                 </div>
              </div>

              <div class="space-y-3">
                 <button (click)="finish()" class="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
                    Voltar ao Início
                 </button>
                 <div class="text-xs text-slate-400 font-medium flex justify-between px-4">
                    <span>Saldo: {{ authService.currentUser()?.balance | number:'1.2-2' }}€</span>
                    <span>Minutos Grátis: {{ authService.currentUser()?.trialMinutesLeft }}</span>
                 </div>
              </div>
           </div>
        </div>
      }

    </div>
  `
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  @ViewChild('selfVideo') selfVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  expertId = signal<string | null>(null);
  expert = signal<Expert | undefined>(undefined);
  
  micEnabled = signal(true);
  cameraEnabled = signal(true);
  isChatOpen = signal(false);
  showReceipt = signal(false);
  showEndConfirmation = signal(false);
  
  messages = signal<ChatMessage[]>([]);
  currentMessage = signal('');
  
  elapsedSeconds = signal(0);
  timerInterval: any;
  finalReceipt = signal<{ cost: number, minutesUsed: number } | null>(null);
  
  private expertService = inject(ExpertService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  stream: MediaStream | null = null;

  // Calculates current estimated cost (visual only)
  currentCost = computed(() => {
    const expert = this.expert();
    if (!expert) return 0;
    const minutes = this.elapsedSeconds() / 60;
    
    // Check if free trial covers it visualy
    const user = this.authService.currentUser();
    if (user && user.trialMinutesLeft > minutes) {
       return 0;
    }

    return (minutes * expert.pricePerMin) / 100;
  });
  
  isFreeMode = computed(() => {
     const user = this.authService.currentUser();
     const minutes = this.elapsedSeconds() / 60;
     return user && user.trialMinutesLeft > minutes;
  });

  formattedTime = computed(() => {
    const secs = this.elapsedSeconds();
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  });

  async ngOnInit() {
    this.expertId.set(this.route.snapshot.paramMap.get('id'));
    
    // Security Check: Login & Balance OR Trial
    if (!this.authService.isLoggedIn()) {
       this.router.navigate(['/']);
       return;
    }
    const user = this.authService.currentUser();
    const hasBalance = user && user.balance > 0;
    const hasTrial = user && user.trialMinutesLeft > 0;

    if (!user || (!hasBalance && !hasTrial)) {
       alert('Saldo insuficiente. Por favor carregue a carteira.');
       this.router.navigate(['/results']);
       return;
    }

    if (this.expertId()) {
      this.expert.set(this.expertService.getExpertById(this.expertId()!));
    }

    if (!this.expert()) {
      alert('Especialista não encontrado!');
      this.router.navigate(['/']);
      return;
    }

    // Start Timer
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(v => v + 1);
    }, 1000);

    await this.setupCamera();
  }

  async setupCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (this.selfVideo && this.selfVideo.nativeElement) {
        this.selfVideo.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      this.cameraEnabled.set(false);
      this.micEnabled.set(false);
    }
  }

  toggleMic() {
    this.micEnabled.update(v => !v);
    if (this.stream) {
      this.stream.getAudioTracks().forEach(track => track.enabled = this.micEnabled());
    }
  }

  toggleCamera() {
    this.cameraEnabled.update(v => !v);
    if (this.stream) {
      this.stream.getVideoTracks().forEach(track => track.enabled = this.cameraEnabled());
    }
  }

  toggleChat() {
    this.isChatOpen.update(v => !v);
    if (this.isChatOpen()) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    const text = this.currentMessage().trim();
    if (!text) return;
    
    this.messages.update(msgs => [...msgs, { sender: 'me', text, time: new Date() }]);
    this.currentMessage.set('');
    
    setTimeout(() => this.scrollToBottom(), 50);

    // Auto-reply simulation
    setTimeout(() => {
       this.messages.update(msgs => [...msgs, { sender: 'expert', text: 'Entendido. Pode mostrar o problema de outro ângulo?', time: new Date() }]);
       setTimeout(() => this.scrollToBottom(), 50);
    }, 3000);
  }

  scrollToBottom() {
    if (this.chatContainer?.nativeElement) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  promptEndCall() {
    this.showEndConfirmation.set(true);
  }

  cancelEndCall() {
    this.showEndConfirmation.set(false);
  }

  confirmEndCall() {
    this.showEndConfirmation.set(false);
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    // Process Payment via Auth Service (Handles Trial vs Balance)
    const receipt = this.authService.processSessionPayment(
      this.elapsedSeconds(), 
      this.expert()?.pricePerMin || 0
    );
    
    this.finalReceipt.set(receipt);
    this.showReceipt.set(true);
  }

  finish() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}