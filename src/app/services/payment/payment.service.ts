// src/app/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { from, Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private toastService: ToastService,
    private apiService: ApiService
  ) {
  }

  proceedPayment(data): Observable<any> {
      return from(this.apiService.create(`transaction/new`, data))
        .pipe(
          map((resp) => {
            return resp;
          }),
          catchError(error => of({ error }))
        );
  }

  checkTransactionStatus(paymentRef: string, invoiceId?: string): Observable<any> {
    // console.log('paymentRef: ', paymentRef);
    const checkDepositEndPoint = environment.backendUrl + "/payment/check/" + paymentRef;

    return this.http.get<any>(checkDepositEndPoint).pipe(
      tap((response) => {
        return response;
        // console.log('response of check: ', response);
      }),
      catchError((error) => {
        // console.error('Error occurred while checking transaction:', error);
        return throwError(error);
      })
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
      })
    );
  }

}
