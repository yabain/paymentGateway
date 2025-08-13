import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

declare global {
  interface Window { FlutterwaveCheckout: any; }
}

@Injectable({ providedIn: 'root' })
export class FlutterwaveService {
  private backendUrl = 'http://localhost:3000/payments'; // adapte

  constructor(private http: HttpClient) {}

  // charge le script Flutterwave dynamiquement
  loadFlutterwaveScript(): Promise<void> {
    if ((window as any).FlutterwaveCheckout) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.flutterwave.com/v3.js';
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.body.appendChild(s);
    });
  }

  async initializePayment(amount: number, email?: string, currency = 'XAF') {
    // demande au backend de créer txRef
    console.log('initialize')
    const resp: any = await firstValueFrom(this.http.post(`${this.backendUrl}/initialize`, { amount, currency, customerEmail: email }));
    return resp; // contient txRef, publicKey, amount, currency, ...
  }

  openFlutterwaveModal(opts: { txRef: string; amount: number; currency: string; customerEmail?: string; publicKey: string }) {
    const { txRef, amount, currency, customerEmail, publicKey } = opts;
    // utilise FlutterwaveCheckout (doc: Inline / v3)
    (window as any).FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: txRef,
      amount,
      currency,
      customer: { email: customerEmail || '' },
      onclose: () => {
        // l'utilisateur a fermé la fenêtre: front peut faire un polling
        console.log('modal closed');
      },
      callback: (data: any) => {
        // data contient info transaction ; on peut notifier backend ou simplement laisser webhook/verify faire le job
        console.log('flutterwave callback', data);
        // Par sécurité, tu peux appeler le status endpoint pour forcer vérification
      },
    });
  }

  // endpoint pour vérifier le status depuis le frontend (polling)
  async checkStatus(txRef: string) {
    return firstValueFrom(this.http.get(`${this.backendUrl}/status/${encodeURIComponent(txRef)}`));
  }
}
