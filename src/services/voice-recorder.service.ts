import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VoiceRecorderService {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];

    isRecording = signal(false);

    async startRecording(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            this.isRecording.set(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject('MediaRecorder not initialized');
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.isRecording.set(false);

                // Stop all tracks to release the microphone
                this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
                this.mediaRecorder = null;

                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }
}
