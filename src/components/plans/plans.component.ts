import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
    selector: 'app-plans',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './plans.component.html',
    styleUrls: ['./plans.component.css']
})
export class PlansComponent {
    authService = inject(AuthService);
    supabaseService = inject(SupabaseService);
    route = inject(ActivatedRoute);

    isLoading: boolean = false;

    constructor() {
        this.route.queryParams.subscribe(params => {
            if (params['session_id']) {
                // Sucesso
                alert('Assinatura realizada com sucesso! Aproveite os benefícios.');
                // Limpar URL
                window.history.replaceState({}, document.title, window.location.pathname);
                // Forçar atualização do perfil
                this.authService.updateProfile({});
            } else if (params['cancel']) {
                // Cancelamento
                alert('Assinatura cancelada. Você não foi cobrado.');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        });
    }

    async subscribe(plan: 'pro' | 'premium') {
        if (this.isLoading) return;

        const user = this.authService.currentUser();
        if (!user) {
            alert('Você precisa estar logado para assinar.');
            return;
        }

        this.isLoading = true;

        try {
            const { data, error } = await this.supabaseService.createCheckoutSession(
                0, // valor ignorado para subscription
                window.location.href, // successUrl (retorna pra mesma pagina com session_id)
                window.location.href + '?cancel=true', // cancelUrl
                'subscription', // type
                plan // plan
            );

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Erro ao iniciar assinatura:', err);
            alert('Erro ao iniciar assinatura. Tente novamente.');
        } finally {
            this.isLoading = false;
        }
    }
}
