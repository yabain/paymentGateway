import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  constructor(

    private apiService: ApiService,
  ) {}

  // For admin only
  getBalance(userId?: string): Observable<any | undefined> {
    return this.apiService.getWithToken(userId ? 'balance/' + userId : 'balance').pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching balance:', error);
        return of([]);
      }),
    );
  }

}
