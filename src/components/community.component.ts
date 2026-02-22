import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-community',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="animate-fade pb-20">
      <main class="max-w-4xl mx-auto px-4 sm:px-6">
        
        <!-- Header -->
        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight font-display mb-2">Comunidade</h2>
            <p class="text-slate-500 font-medium">Partilha, aprende e conecta-te com outros membros.</p>
          </div>
          
          <div class="flex gap-2">
             <a href="https://chat.whatsapp.com" target="_blank" class="px-6 py-3 bg-[#25D366] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-green-500/10 hover:translate-y-[-2px] transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
             </a>
             <button class="px-6 py-3 bg-white border border-black/5 text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-premium hover:bg-slate-50 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                Filtros
             </button>
          </div>
        </div>

        <!-- Post Input -->
        @if (authService.isLoggedIn()) {
          <div class="glass rounded-[2rem] p-6 mb-12 shadow-premium border border-black/5">
             <div class="flex gap-4">
                <img [src]="authService.currentUser()?.avatar" class="w-12 h-12 rounded-2xl shadow-sm">
                <div class="flex-1">
                   <textarea 
                      [(ngModel)]="newPostContent"
                      class="w-full bg-slate-50/50 rounded-2xl p-4 text-sm font-medium outline-none border border-black/5 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none min-h-[100px]"
                      placeholder="Partilha algo com a comunidade..."
                   ></textarea>
                   <div class="flex items-center justify-between mt-4">
                      <div class="flex gap-2">
                         <button class="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                         </button>
                         <button class="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                         </button>
                      </div>
                      <button 
                         (click)="createPost()"
                         [disabled]="!newPostContent.trim()"
                         class="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:translate-y-0 hover:translate-y-[-2px] hover:shadow-lg transition-all active:scale-95"
                      >
                         Publicar
                      </button>
                   </div>
                </div>
             </div>
          </div>
        }

        <!-- Feed -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          @for (post of feedPosts(); track post.id) {
            <div class="bg-white rounded-[2.5rem] p-8 shadow-premium border border-black/5 hover:translate-y-[-6px] transition-all duration-500 group">
                <div class="flex items-center gap-4 mb-6">
                   <div class="relative">
                      <img [src]="post.profiles?.avatar || 'https://i.pravatar.cc/150'" class="w-14 h-14 rounded-2xl object-cover shadow-md group-hover:shadow-xl transition-all">
                      @if (post.profiles?.is_expert) {
                        <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
                           <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                        </div>
                      }
                   </div>
                   <div class="flex-1">
                      <div class="font-black text-slate-900 text-base tracking-tight">{{ post.profiles?.name || 'Utilizador' }}</div>
                      <div class="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{{ post.profiles?.is_expert ? 'Especialista' : 'Membro' }}</div>
                   </div>
                   <button class="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5h.01M12 12h.01M12 19h.01"/></svg>
                   </button>
                </div>
                
                @if (post.image_url) { 
                  <div class="rounded-3xl overflow-hidden mb-6 bg-slate-50 border border-black/5 aspect-video relative">
                    <img [src]="post.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div> 
                }
                
                <p class="text-slate-600 text-[14px] font-medium leading-relaxed mb-8 px-1">
                   {{ post.content }}
                </p>

                <div class="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div class="flex items-center gap-6">
                    <button class="flex items-center gap-2.5 text-slate-300 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-widest group/btn">
                       <svg class="h-6 w-6 group-active/btn:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                       {{ post.likes }}
                    </button>
                    <button class="flex items-center gap-2.5 text-slate-300 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest">
                       <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                       Comentar
                    </button>
                  </div>
                  <button class="text-slate-200 hover:text-blue-600 transition-colors">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  </button>
                </div>
            </div>
          }
        </div>
      </main>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class CommunityComponent implements OnInit {
    authService = inject(AuthService);
    supabaseService = inject(SupabaseService);

    feedPosts = signal<any[]>([]);
    newPostContent = '';

    async ngOnInit() {
        await this.loadPosts();
    }

    async loadPosts() {
        const { data } = await this.supabaseService.getPosts();
        if (data) this.feedPosts.set(data);
    }

    async createPost() {
        if (!this.newPostContent.trim()) return;
        const user = this.authService.currentUser();
        if (!user) return;

        await this.supabaseService.createPost({
            profile_id: user.id,
            content: this.newPostContent
        });
        this.newPostContent = '';
        await this.loadPosts();
    }
}
