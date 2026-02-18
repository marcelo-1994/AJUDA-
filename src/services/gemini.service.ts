import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      const apiKey = (import.meta as any)?.env?.['GEMINI_API_KEY']
        || (typeof process !== 'undefined' && process.env?.['API_KEY'])
        || 'PLACEHOLDER_API_KEY';
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
      const response = await (this.ai as any).models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{
          role: 'user',
          parts: [{
            text: `Analyze this user problem: "${query}". 
            1. Identify the best expert category from this list: ['Bricolage', 'Tecnologia', 'Beleza', 'Culinária', 'Mecânica', 'Jurídico', 'Outros'].
            2. Provide a short, immediate "Quick Tip" (2 sentences max) to help them while they wait.
            3. Suggest a matching score (0-100) indicating how well this problem matches a general expert in that field.`
          }]
        }],
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
      return {
        category: 'Outros',
        quickTip: 'Não conseguimos analisar o problema automaticamente, mas nossos especialistas podem ajudar.',
        matchScore: 50
      };
    }
  }

  async analyzeVoiceProblem(audioBlob: Blob): Promise<any> {
    if (!this.ai) {
      return {
        category: 'Outros',
        quickTip: 'Análise automática indisponível. Nossos especialistas podem ajudar!',
        matchScore: 50
      };
    }

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      const response = await (this.ai as any).models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: audioBlob.type,
                  data: base64Audio
                }
              },
              {
                text: `Analyze this help request audio. 
                1. Transcribe the core problem briefly into 'transcription'.
                2. Identify the best expert category from this list: ['Bricolage', 'Tecnologia', 'Beleza', 'Culinária', 'Mecânica', 'Jurídico', 'Outros'] into 'category'.
                3. Provide a short, immediate "Quick Tip" (2 sentences max) to help them while they wait into 'quickTip'.
                4. Suggest a matching score (0-100) into 'matchScore'.
                Return ONLY JSON.`
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcription: { type: Type.STRING },
              category: { type: Type.STRING },
              quickTip: { type: Type.STRING },
              matchScore: { type: Type.INTEGER }
            },
            required: ['transcription', 'category', 'quickTip', 'matchScore']
          }
        }
      });

      const text = response.text;
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Voice Analysis Error:', error);
      return {
        category: 'Outros',
        quickTip: 'Não conseguimos analisar o áudio, mas um especialista pode ouvir!',
        matchScore: 50
      };
    }
  }
}