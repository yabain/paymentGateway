import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class MpesaService {
  constructor(private apiService: ApiService) {}

  getBalance(): Observable<any> {
    return this.apiService.getWithoutId('mpesa/balance').pipe(
      map((res: any) => res),
      catchError(() => of(false)),
    );
  }

  getPayinList(params: {
    page: number;
    limit: number;
    from?: string;
    to?: string;
    status?: string;
  }): Observable<any> {
    return this.apiService.getWithoutId('mpesa/payin-transactions', params).pipe(
      map((res: any) => res),
      catchError(() => of(false)),
    );
  }

  getPayoutList(params: {
    page: number;
    limit: number;
    from?: string;
    to?: string;
    status?: string;
  }): Observable<any> {
    return this.apiService.getWithoutId('mpesa/payout-transactions', params).pipe(
      map((res: any) => res),
      catchError(() => of(false)),
    );
  }
}
