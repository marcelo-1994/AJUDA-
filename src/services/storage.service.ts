import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private supabaseService = inject(SupabaseService);
    private bucketName = 'chat-media';

    /**
     * Uploads a file to Supabase Storage.
     */
    async uploadFile(path: string, file: File | Blob): Promise<string | null> {
        const supabase = this.supabaseService.getClient();
        if (!supabase) return null;

        const { data, error } = await supabase.storage
            .from(this.bucketName)
            .upload(path, file, {
                upsert: true
            });

        if (error) {
            console.error('Upload Error:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(this.bucketName)
            .getPublicUrl(data.path);

        return publicUrl;
    }

    /**
     * Generates a unique path for a file.
     */
    generatePath(userId: string, folder: string, extension: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        return `${userId}/${folder}/${timestamp}-${random}.${extension}`;
    }
}
