import { Component, inject } from '@angular/core';
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

    async subscribe(plan: 'pro' | 'premium') {
        const user = this.authService.currentUser();
        if (!user) {
            alert('Você precisa estar logado para assinar.');
            return;
        }

        try {
            const { data, error } = await this.supabaseService.createCheckoutSession(
                0, // valor ignorado para subscription
                window.location.href, // successUrl (retorna pra mesma pagina/modal)
                window.location.href, // cancelUrl
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
        }
    }
}
