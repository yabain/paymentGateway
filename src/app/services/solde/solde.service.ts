import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class SoldeService {
  constructor(

    private apiService: ApiService,
  ) {}

  // For admin only
  getSolde(): Observable<any | undefined> {
    return this.apiService.getWithToken('solde').pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching solde:', error);
        return of([]);
      }),
    );
  }

}
