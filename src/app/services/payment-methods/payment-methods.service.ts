import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

export enum PaymentMethodProvider {
  FLUTTERWAVENGN = 'FlutterwaveNGN',
  FLUTTERWAVEXAF = 'FlutterwaveXAF',
  PAYSTACKKES = 'PaystackKES',
  NONE = 'none',
}

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodsService {

  constructor(
    private apiService: ApiService,
  ) {}
  getOnePaymentMethods(
    id: string,
  ): Observable<any> {
    return this.apiService.getById('payment-methods/', id).pipe(
      map((res: any) => res),
      catchError(this.handleError<any>({ data: [] })),
    );
  }

  getAllPaymentMethods(): Observable<any> {
    return this.apiService.getWithoutId('payment-methods').pipe(
      map((res: any) => res),
      catchError(this.handleError<any>({ data: [] })),
    );
  }

  createPaymentMethods(payload: {
  name: string,
  statusPayin: boolean,
  statusPayout: boolean,
  image: string,
  countryId: string,
  provider: PaymentMethodProvider,
  taxesPayment: number,
  taxesTransfer: number
  minAmount: number,
  maxAmount: number,
  }): Observable<any> {
    return this.apiService.create('payment-methods', payload).pipe(
      map((res: any) => {
        console.log('create payment methods response: ', res);
        return res;
      }),
      catchError(this.handleError<any>({ error: true })),
    );
  }

  updatePaymentMethods(
    id: string,
    payload: Partial<{
      name: string;
      statusPayin: boolean;
      statusPayout: boolean;
      image: string;
      countryId: string;
      provider: PaymentMethodProvider | string;
      taxesPayment: number;
      taxesTransfer: number;
      minAmount: number;
      maxAmount: number;
    }>,
  ): Observable<any> {
    return this.apiService.update('payment-methods', id, payload).pipe(
      map((res: any) => res),
      catchError(this.handleError<any>({ error: true })),
    );
  }

  private handleError<T>(result: T) {
    return (_error: any): Observable<T> => {
      return of(result);
    };
  }  
}
