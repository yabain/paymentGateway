import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, from, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

@Injectable({ providedIn: 'root' })
export class FlutterwaveService {
  constructor(private apiService: ApiService) {}

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


  // endpoint pour vérifier le status depuis le frontend (polling)
  checkStatus(txRef: string): Observable<any> {
    return this.apiService
      .getById(`fw/verify-payin`, encodeURIComponent(txRef))
      .pipe(
        map((res: any) => {
          if (res) {
            return res;
          }
          return false;
        }),
        catchError((err) => {
          console.error('Error getting favorites:', err);
          return of(false); // Emit false if there's an error
        }),
      );
  }

  getApplicationBalance(countryWallet: string = 'CM'): Observable<any> {
    return this.apiService.getById(`fw/balance`, countryWallet).pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting favorites:', err);
        return of(false); // Emit false if there's an error
      }),
    );
  }


  getPayinList(countryWallet: string = 'CM', periode: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`fw/payin-transactons/` + countryWallet + '?periode=' + periode).pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting favorites:', err);
        return of(false); // Emit false if there's an error
      }),
    );
  }


  getPayoutList(countryWallet: string = 'CM', periode: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`fw/payout-transactons/` + countryWallet + '?periode=' + periode).pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting favorites:', err);
        return of(false); // Emit false if there's an error
      }),
    );
  }

  getBanksList(countryIso2): Observable<any> {
    return this.apiService
      .getById(`fw/get-bank`, encodeURIComponent(countryIso2))
      .pipe(
        map((res: any) => {
          if (res) {
            return res;
          }
          return false;
        }),
        catchError((err) => {
          console.error('Error getting favorites:', err);
          return of(false); // Emit false if there's an error
        }),
      );
  }

  listTransactions(countryCode: string = 'CMR'): Observable<any> {
    return this.apiService.getById(`fw/transactions`, countryCode).pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting favorites:', err);
        return of(false); // Emit false if there's an error
      }),
    );
  }

  // Not used

  initializePayment(
    amount: number,
    email?: string,
    currency = 'XAF',
  ): Observable<any> {
    // demande au backend de créer txRef
    console.log('initialize');
    return from(
      this.apiService.create(`payin/initialize`, {
        amount,
        currency,
        customerEmail: email,
      }),
    ).pipe(
      map((resp) => {
        return resp; // contient txRef, publicKey, amount, currency, ...
      }),
      catchError((error) => of({ error })),
    );
  }

  openFlutterwaveModal(opts: {
    txRef: string;
    amount: number;
    currency: string;
    customerEmail?: string;
    publicKey: string;
  }) {
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

}
