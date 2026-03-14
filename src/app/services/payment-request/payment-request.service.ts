import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import {
  PaymentRequestItem,
  PaymentRequestListResponse,
  PaymentRequestQuery,
} from './payment-request.types';

@Injectable({
  providedIn: 'root',
})
export class PaymentRequestService {

  constructor(
    private apiService: ApiService,
  ) {}
  getMyPaymentRequests(
    query: PaymentRequestQuery = {},
  ): Observable<PaymentRequestListResponse> {
    return this.apiService.getWithoutId('payment-request/my', query).pipe(
      map((res: any) => res),
      catchError(this.handleError<PaymentRequestListResponse>({ data: [] })),
    );
  }

  getAllSystemPaymentRequests(
    query: PaymentRequestQuery = {},
  ): Observable<PaymentRequestListResponse> {
    return this.apiService.getWithoutId('payment-request', query).pipe(
      map((res: any) => res),
      catchError(this.handleError<PaymentRequestListResponse>({ data: [] })),
    );
  }

  createPaymentRequest(payload: {
    email: string;
    amount: number;
    mobile_money: { phone: string; provider: string };
    reason?: string;
  }): Observable<any> {
    return this.apiService.create('payment-request', payload).pipe(
      map((res: any) => {
        console.log('create payment request response: ', res);
        return res;
      }),
      catchError(this.handleError<any>({ error: true })),
    );
  }

  private handleError<T>(result: T) {
    return (_error: any): Observable<T> => {
      return of(result);
    };
  }  
}

