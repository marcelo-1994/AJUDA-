import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Expert {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  pricePerMin: number; // in cents
  isOnline: boolean;
  avatarUrl: string;
  specialties: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private supabaseService = inject(SupabaseService);

  // Categorias carregadas do banco
  private categories = signal<string[]>([]);

  // Experts carregados do banco
  private experts = signal<Expert[]>([]);

  // Flag de carregamento
  loading = signal<boolean>(false);

  constructor() {
    this.loadCategories();
    this.loadExperts();
  }

  /**
   * Carrega categorias do Supabase.
   */
  private async loadCategories() {
    try {
      const { data, error } = await this.supabaseService.getCategories();
      if (data && !error) {
        this.categories.set(data.map((c: any) => c.name));
      } else {
        this.setFallbackCategories();
      }
    } catch (error) {
      console.warn('Failed to load categories from Supabase:', error);
      this.setFallbackCategories();
    }
  }

  private setFallbackCategories() {
    this.categories.set([]);
  }

  /**
   * Carrega todos os experts do Supabase.
   */
  async loadExperts() {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabaseService.getExperts();
      if (data && !error) {
        this.experts.set(data.map((e: any) => this.mapDbExpert(e)));
      } else {
        this.experts.set([]);
      }
    } catch (error) {
      console.warn('Failed to load experts from Supabase:', error);
      this.experts.set([]);
    }
    this.loading.set(false);
  }

  /**
   * Mapeia os dados do banco para a interface Expert.
   */
  private mapDbExpert(row: any): Expert {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      rating: parseFloat(row.rating) || 0,
      reviews: row.reviews || 0,
      pricePerMin: row.price_per_min || 0,
      isOnline: row.is_online || false,
      avatarUrl: row.avatar_url || '',
      specialties: row.specialties || []
    };
  }

  getExperts() {
    return this.experts;
  }

  getExpertById(id: string) {
    return this.experts().find(e => e.id === id);
  }

  /**
   * Busca um expert pelo ID diretamente no Supabase (para dados atualizados).
   */
  async getExpertByIdAsync(id: string): Promise<Expert | null> {
    const { data, error } = await this.supabaseService.getExpertById(id);
    if (data && !error) {
      return this.mapDbExpert(data);
    }
    return null;
  }

  getCategories() {
    return this.categories;
  }

  filterExpertsByCategory(category: string) {
    return this.experts().filter(e => e.category === category || category === 'Outros');
  }

  /**
   * Filtra experts por categoria buscando no Supabase.
   */
  async filterExpertsByCategoryAsync(category: string): Promise<Expert[]> {
    if (category === 'Outros') {
      return this.experts();
    }
    const { data, error } = await this.supabaseService.getExpertsByCategory(category);
    if (data && !error) {
      return data.map((e: any) => this.mapDbExpert(e));
    }
    return [];
  }

  /**
   * Adiciona um novo expert no Supabase.
   */
  async addNewExpert(expert: Expert) {
    const dbExpert = {
      name: expert.name,
      category: expert.category,
      rating: expert.rating,
      reviews: expert.reviews,
      price_per_min: expert.pricePerMin,
      is_online: expert.isOnline,
      avatar_url: expert.avatarUrl,
      specialties: expert.specialties
    };

    const { data, error } = await this.supabaseService.addExpert(dbExpert);

    if (data && !error) {
      const newExpert = this.mapDbExpert(data);
      this.experts.update(list => [newExpert, ...list]);

      // Garantir que a categoria existe na lista
      this.categories.update(cats => {
        if (!cats.includes(expert.category)) {
          return [...cats, expert.category];
        }
        return cats;
      });
    } else {
      // Fallback local
      this.experts.update(list => [expert, ...list]);
      this.categories.update(cats => {
        if (!cats.includes(expert.category)) {
          return [...cats, expert.category];
        }
        return cats;
      });
    }
  }
}