// src/app/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { from, Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';
import { ToastService } from '../toast/toast.service';
import { FlutterwaveService } from '../flutterwave/flutterwave.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  paymentMethode = {
    OM: 'ORANGE',
    MTN: 'MTN',
    PAYPAL: 'PAYPAL',
    VISA: 'VISA',
    BANK: 'BANK',
  };
  status = {
    INITIALIZED: 'transaction_initialized',

    PAYINPENDING: 'transaction_payin_pending',
    PAYINERROR: 'transaction_payin_error',
    PAYINCLOSED: 'transaction_payin_closed',
    PAYINSUCCESS: 'transaction_payin_success',

    PAYOUTPENDING: 'transaction_payout_pending',
    PAYOUTSUCCESS: 'transaction_payout_success',
    PAYOUTERROR: 'transaction_payout_error',
    PAYOUTCLOSED: 'transaction_payout_closed',
  };
  transactionType = {
    DEPOSITE: 'deposit',
    WITHDRAWAL: 'withdrawal',
    PAYMENT: 'payment',
    TRANSFER: 'transfer',
    FUNDRAISING: 'fundraising',
    SUBSCRIPTION: 'subscription',
  };
  amount = 100;
  private txRef: string = '';
  private pollTimer: any;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private toastService: ToastService,
    private fw: FlutterwaveService,
    private apiService: ApiService,
  ) {}

  proceedPayment(data): Observable<any> {
    console.log('proceedPayment data: ', data);
    return from(this.apiService.create(`fw/payin`, data)).pipe(
      map((resp) => {
        return resp;
      }),
      catchError((error) => of({ error })),
    );
  }

  proceedWithdarawal(data): Observable<any> {
    console.log('proceedWithdarawal data: ', data);
    return from(this.apiService.create(`fw/withdrawal`, data)).pipe(
      map((resp) => {
        return resp;
      }),
      catchError((error) => of({ error })),
    );
  }

  verifyAndClosePayin(txRef): Observable<any> {
    return this.apiService.getById(`fw/verify-close-payin`, txRef).pipe(
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

  getPayinByTxRef(txRef): Observable<any> {
    return this.apiService.getById(`payin/get-txRef`, txRef).pipe(
      map((res: any) => {
        return res;
      }),
    );
  }

  getStatistics(): Observable<any | undefined> {
    return this.apiService.getWithToken('transaction/get-statistics').pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching transactions statistics:', error);
        return of([]);
      }),
    );
  }
  
  getTransactionList(page: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`transaction` + '?page=' + page).pipe(
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
  
  getPayoutTransactionList(page: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`transaction/all-payout` + '?page=' + page).pipe(
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

  getPayinTransactionList(page: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`transaction/all-payin` + '?page=' + page).pipe(
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

  getAllTransactionOfUser(userId: string, page: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`transaction/user-transactions/${userId}` + '?page=' + page).pipe(
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

  acceptPayment(transactionId): Observable<any> {
    return this.apiService.getById(`fw/payout`, transactionId).pipe(
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

  getTransactionListByStatus(status: string, page: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`transaction/get-payout-list/${status}` + '?page=' + page).pipe(
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

  openPayin(txRef): Observable<any> {
    return this.apiService.getById(`fw/open-payin`, txRef).pipe(
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

  verifyAndOpenPayin(txRef): Observable<any> {
    return this.apiService.getById(`fw/verify-open`, txRef).pipe(
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

  checkTransactionStatus(
    paymentRef: string,
    invoiceId?: string,
  ): Observable<any> {
    // console.log('paymentRef: ', paymentRef);
    const checkDepositEndPoint =
      environment.backendUrl + '/payment/check/' + paymentRef;

    return this.http.get<any>(checkDepositEndPoint).pipe(
      tap((response) => {
        return response;
        // console.log('response of check: ', response);
      }),
      catchError((error) => {
        // console.error('Error occurred while checking transaction:', error);
        return throwError(error);
      }),
    );
  }

  generateId(): string {
    const now = new Date();

    // Generate the components of the date and time
    const year = now.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = this.padNumber(now.getMonth() + 1, 2); // Months are zero-based, hence the +1
    const day = this.padNumber(now.getDate(), 2);
    const hours = this.padNumber(now.getHours(), 2);
    const minutes = this.padNumber(now.getMinutes(), 2);
    const seconds = this.padNumber(now.getSeconds(), 2);

    // Generate a random number between 100 and 999
    const randomNum = Math.floor(Math.random() * 900) + 100;

    // Construct the ID
    const id = `IN${randomNum}#${year}${month}${day}${hours}${minutes}${seconds}`;

    return id;
  }

  // Helper function to pad numbers with leading zeros
  private padNumber(num: number, size: number): string {
    let s = num.toString();
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  }

  getTransactionData(transactionId: string): Observable<boolean> {
    return this.apiService.getById(`transaction`, transactionId).pipe(
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

  getTransactionStatus(transaction){
    if(transaction?.status === 'transaction_initialized') return 'TRANSACTION PENDING';
    else if(transaction?.status === 'transaction_payin_pending') return 'PAYIN_PENDING';
    else if(transaction?.status === 'transaction_payin_success') return 'PAYIN_SUCCESS';
    else if(transaction?.status === 'transaction_payin_error') return 'PAYIN_ERROR';
    else if(transaction?.status === 'transaction_payin_closed') return 'PAYIN_CANCELED';
    else if(transaction?.status === 'transaction_payout_rejected') return 'PAYOUT_REJECTED';
    else if(transaction?.status === 'transaction_payout_pending') return 'PAYOUT_PENDING';
    else if(transaction?.status === 'transaction_payout_success') return 'PAYOUT_SUCCESS';
    else if(transaction?.status === 'transaction_payout_error') return 'PAYOUT_ERROR';
    else if(transaction?.status === 'transaction_payout_closed') return 'PAYOUT_CANCELED';
    else return 'UNKNOW';
  }
}
