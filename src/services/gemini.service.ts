import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      // Tentar obter a chave da API de forma segura (browser-safe)
      const apiKey = (typeof process !== 'undefined' && process.env?.['API_KEY'])
        || (import.meta as any)?.env?.['GEMINI_API_KEY']
        || '';
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    } catch (e) {
      console.warn('Gemini AI not initialized:', e);
    }
  }

  async analyzeProblem(query: string): Promise<any> {
    if (!this.ai) {
      return {
        category: 'Outros',
        quickTip: 'Análise automática indisponível. Nossos especialistas podem ajudar!',
        matchScore: 50
      };
    }
    try {
      const model = 'gemini-2.5-flash';

      const response = await this.ai.models.generateContent({
        model: model,
        contents: `Analyze this user problem: "${query}". 
        1. Identify the best expert category from this list: ['Bricolage', 'Tecnologia', 'Beleza', 'Culinária', 'Mecânica', 'Jurídico', 'Outros'].
        2. Provide a short, immediate "Quick Tip" (2 sentences max) to help them while they wait.
        3. Suggest a matching score (0-100) indicating how well this problem matches a general expert in that field.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              quickTip: { type: Type.STRING },
              matchScore: { type: Type.INTEGER }
            },
            required: ['category', 'quickTip', 'matchScore']
          }
        }
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Analysis Error:', error);
      // Fallback in case of error
      return {
        category: 'Outros',
        quickTip: 'Não conseguimos analisar o problema automaticamente, mas nossos especialistas podem ajudar.',
        matchScore: 50
      };
    }
  }
}