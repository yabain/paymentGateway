import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import {
  DonationItem,
  FundraisingItem,
  FundraisingQuery,
  PaginatedResponse,
} from './fundraising.types';

@Injectable({
  providedIn: 'root',
})
export class FundraisingService {
  constructor(private apiService: ApiService) {}

  createFundraising(payload: any): Observable<any> {
    return this.apiService.create('fundraising', payload).pipe(
      map((res) => res),
      catchError(this.handleError<any>({ error: true })),
    );
  }

  getAllSystem(query: FundraisingQuery = {}): Observable<PaginatedResponse<FundraisingItem> | any> {
    return this.apiService.getWithoutId('fundraising', query).pipe(
      map((res) => res),
      catchError(this.handleError<any>({ items: [] })),
    );
  }

  getMyFundraisings(query: FundraisingQuery = {}): Observable<PaginatedResponse<FundraisingItem> | any> {
    return this.apiService.getWithoutId('fundraising/my/list', query).pipe(
      map((res) => res),
      catchError(this.handleError<any>({ items: [] })),
    );
  }

  getMyActiveFundraisings(query: FundraisingQuery = {}): Observable<PaginatedResponse<FundraisingItem> | any> {
    return this.apiService.getWithoutId('fundraising/my/active', query).pipe(
      map((res) => res),
      catchError(this.handleError<any>({ items: [] })),
    );
  }

  getUserFundraisings(userId: string, query: FundraisingQuery = {}): Observable<PaginatedResponse<FundraisingItem> | any> {
    return this.apiService
      .getWithoutId(`fundraising/user/${userId}/list`, query)
      .pipe(
        map((res) => res),
        catchError(this.handleError<any>({ items: [] })),
      );
  }

  getUserActiveFundraisings(userId: string, query: FundraisingQuery = {}): Observable<PaginatedResponse<FundraisingItem> | any> {
    return this.apiService
      .getWithoutId(`fundraising/user/${userId}/active`, query)
      .pipe(
        map((res) => res),
        catchError(this.handleError<any>({ items: [] })),
      );
  }

  getUserActivePublicFundraisings(userId: string, query: FundraisingQuery = {}): Observable<PaginatedResponse<FundraisingItem> | any> {
    return this.apiService
      .getWithoutId(`fundraising/user/${userId}/active-public`, query)
      .pipe(
        map((res) => res),
        catchError(this.handleError<any>({ items: [] })),
      );
  }

  getTotalDonations(): Observable<any> {
    return this.apiService.getWithoutId('fundraising/donations/stats/total').pipe(
      map((res) => res),
      catchError(this.handleError<any>({ totalDonations: 0 })),
    );
  }

  getFundraisingDonationStats(fundraisingId: string): Observable<any> {
    return this.apiService.get(`fundraising/${fundraisingId}/donations/stats`).pipe(
      map((res: any) => res),
      catchError(this.handleError<any>({})),
    );
  }

  getFundraisingDonations(fundraisingId: string, query: FundraisingQuery = {}): Observable<PaginatedResponse<DonationItem> | any> {
    return this.apiService
      .getWithoutId(`fundraising/${fundraisingId}/donations`, query)
      .pipe(
        map((res) => res),
        catchError(this.handleError<any>({ items: [] })),
      );
  }

  getUserDonationStats(userId: string): Observable<any> {
    return this.apiService
      .getWithoutId(`fundraising/user/${userId}/donations/stats`)
      .pipe(
        map((res) => res),
        catchError(this.handleError<any>({})),
      );
  }

  getDonationDetails(donationId: string): Observable<any> {
    return this.apiService.getWithoutId(`fundraising/donations/${donationId}`).pipe(
      map((res) => res),
      catchError(this.handleError<any>({})),
    );
  }

  getFundraisingById(id: string): Observable<FundraisingItem | any> {
    return this.apiService.get(`fundraising/${id}`).pipe(
      map((res: any) => res),
      catchError(this.handleError<any>(null)),
    );
  }

  updateStatus(id: string, status: boolean): Observable<any> {
    return this.apiService
      .updateWithoutId(`fundraising/${id}/status`, { status })
      .pipe(
        map((res) => res),
        catchError(this.handleError<any>({ error: true })),
      );
  }

  updateVisibility(id: string, visibility: 'public' | 'private'): Observable<any> {
    return this.apiService
      .updateWithoutId(`fundraising/${id}/visibility`, { visibility })
      .pipe(
        map((res) => res),
        catchError(this.handleError<any>({ error: true })),
      );
  }

  updateFundraising(id: string, payload: any): Observable<any> {
    return this.apiService.update('fundraising', id, payload).pipe(
      map((res) => res),
      catchError(this.handleError<any>({ error: true })),
    );
  }

  donate(fundraisingId: string, payload: any): Observable<any> {
    return this.apiService.create(`fundraising/${fundraisingId}/donate`, payload).pipe(
      map((res) => res),
      catchError(this.handleError<any>({ error: true })),
    );
  }

  private handleError<T>(result: T) {
    return (_error: any): Observable<T> => {
      return of(result);
    };
  }
}
