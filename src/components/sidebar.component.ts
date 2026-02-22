import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CurrencyService } from '../services/currency.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="fixed left-0 top-0 h-full w-20 md:w-64 glass border-r border-black/5 flex flex-col z-[100] transition-all duration-300">
      <!-- Logo -->
      <div class="p-6 flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <span class="font-black text-xl">A</span>
        </div>
        <span class="font-bold text-xl tracking-tight hidden md:block">AJUDA<span class="text-blue-600">Í</span></span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-8 space-y-2">
        @for (item of menuItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-blue-50 text-blue-600 shadow-sm"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            class="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all font-semibold group"
          >
            <span class="text-xl group-active:scale-90 transition-transform">{{ item.icon }}</span>
            <span class="hidden md:block">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- User Profile Mini -->
      <div class="p-4 border-t border-black/5">
        @if (authService.isLoggedIn()) {
          <div class="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors" (click)="goToProfile()">
            <img [src]="authService.currentUser()?.avatar" class="w-10 h-10 rounded-full border border-slate-200">
            <div class="hidden md:block overflow-hidden">
              <p class="text-sm font-bold text-slate-900 truncate">{{ authService.currentUser()?.name }}</p>
              <p class="text-xs font-bold text-blue-600">{{ currencyService.formatSimple(authService.currentUser()?.balance || 0) }}</p>
            </div>
          </div>
        } @else {
          <button (click)="authService.loginWithGoogle()" class="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hidden md:block active:scale-95 transition-transform">
             Entrar
          </button>
          <button (click)="authService.loginWithGoogle()" class="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm md:hidden flex justify-center active:scale-95 transition-transform">
             🔑
          </button>
        }
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class SidebarComponent {
    authService = inject(AuthService);
    currencyService = inject(CurrencyService);
    private router = inject(Router);

    menuItems = [
        { label: 'Início', path: '/', icon: '🏠' },
        { label: 'Especialistas', path: '/results', icon: '🔍' },
        { label: 'Carteira', path: '/wallet', icon: '💳' },
        { label: 'Comunidade', path: '/community', icon: '👥' },
        { label: 'Configurações', path: '/settings', icon: '⚙️' }
    ];

    goToProfile() {
        this.router.navigate(['/settings']);
    }
}
