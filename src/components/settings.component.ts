import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="animate-fade pb-20">
      <main class="max-w-3xl mx-auto px-4 sm:px-6">
        
        <!-- Header -->
        <div class="mb-10">
          <h2 class="text-3xl font-black text-slate-900 tracking-tight font-display mb-2">Definições</h2>
          <p class="text-slate-500 font-medium">Gere a tua conta e preferências de perfil.</p>
        </div>

        <!-- Profile Section -->
        <div class="glass rounded-[2.5rem] p-8 mb-10 shadow-premium border border-black/5">
           <div class="flex flex-col md:flex-row items-center gap-8">
              <!-- Avatar Upload -->
              <div class="relative group cursor-pointer">
                 <img [src]="profileForm.avatar || 'https://i.pravatar.cc/150'" class="w-32 h-32 rounded-[2.5rem] object-cover shadow-xl border-4 border-white">
                 <div class="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                 </div>
                 <input type="file" class="hidden" #fileInput (change)="onFileSelected($event)">
              </div>

              <!-- Basic Info -->
              <div class="flex-1 space-y-4 w-full">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                       <input [(ngModel)]="profileForm.name" class="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all">
                    </div>
                    <div class="space-y-1.5">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                       <input [value]="authService.currentUser()?.email" disabled class="w-full bg-slate-100 border border-black/5 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-400 cursor-not-allowed">
                    </div>
                 </div>
                 <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio / Especialidade</label>
                    <textarea [(ngModel)]="profileForm.bio" rows="3" class="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"></textarea>
                 </div>
              </div>
           </div>
        </div>

        <!-- Preferences -->
        <div class="glass rounded-[2.5rem] p-8 mb-10 shadow-premium border border-black/5">
           <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 px-1">Preferências</h3>
           
           <div class="space-y-2">
              <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                 <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">🔔</div>
                    <div>
                       <p class="text-sm font-bold text-slate-900">Notificações Push</p>
                       <p class="text-xs text-slate-400 font-medium">Recebe alertas de novas mensagens e chamadas.</p>
                    </div>
                 </div>
                 <div class="w-12 h-6 bg-blue-600 rounded-full relative shadow-inner">
                    <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
              </div>
              
              <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer">
                 <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-lg">🌓</div>
                    <div>
                       <p class="text-sm font-bold text-slate-900">Modo Escuro</p>
                       <p class="text-xs text-slate-400 font-medium">Alterna entre o tema claro e escuro.</p>
                    </div>
                 </div>
                 <div class="w-12 h-6 bg-slate-200 rounded-full relative">
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Danger Zone -->
        <div class="flex items-center justify-between px-4">
           <button (click)="authService.logout()" class="text-xs font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors">Terminar Sessão</button>
           <button (click)="saveProfile()" class="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:translate-y-[-2px] transition-all active:scale-95">
              Guardar Alterações
           </button>
        </div>
      </main>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class SettingsComponent implements OnInit {
    authService = inject(AuthService);
    supabaseService = inject(SupabaseService);

    profileForm = {
        name: '',
        bio: '',
        avatar: ''
    };

    ngOnInit() {
        const user = this.authService.currentUser();
        if (user) {
            this.profileForm.name = user.name || '';
            this.profileForm.bio = user.bio || '';
            this.profileForm.avatar = user.avatar || '';
        }
    }

    onFileSelected(event: any) {
        // Implement avatar upload logic
        alert('Upload de foto em breve...');
    }

    async saveProfile() {
        const user = this.authService.currentUser();
        if (!user) return;

        try {
            const { error } = await this.supabaseService.updateProfile(user.id, {
                name: this.profileForm.name,
                bio: this.profileForm.bio
            });

            if (!error) {
                alert('Perfil atualizado com sucesso!');
                // Ideally we'd refresh the auth user state here
            }
        } catch (e) {
            alert('Erro ao guardar perfil.');
        }
    }
}
