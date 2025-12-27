import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(
    private storage: StorageService,

    private apiService: ApiService,
  ) {}

  // For admin only
  getPlanStatistics(): Observable<any | undefined> {
    return this.apiService.getWithToken('plans/get-statistics').pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  getMyPlanStatistics(): Observable<any | undefined> {
    return this.apiService.getWithToken('plans/get-my-statistics').pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  async changeStatus(planId): Promise<any> {
    try {
      const response = await this.apiService
        .update('plans/update-status', planId, {})
        .toPromise();
      return response;
    } catch (error) {
      console.error('Error to change plan status:', error);
      throw error;
    }
  }
  
  async changeSubscriptionStatus(subscriptionId): Promise<any> {
    try {
      const response = await this.apiService
        .update('subscription/status', subscriptionId, {})
        .toPromise();
      return response;
    } catch (error) {
      console.error('Error to change plan status:', error);
      throw error;
    }
  }

  async deletePlan(planId): Promise<any> {
    try {
      const response = await this.apiService
        .delete('plans/delete', planId)
        .toPromise();
      return response;
    } catch (error) {
      console.error('Error to delete plan: ', error);
      throw error;
    }
  }

  getMyPlansList(userId): Observable<any | undefined> {
    return this.apiService.getById('plans/planList', userId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  getSubscribersList(planId): Observable<any> {
    return this.apiService.getById('subscription/get-subscribers', planId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  getMyPlansData(planId): Observable<any | undefined> {
    return this.apiService.getById('plans/get-data', planId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of(false);
      }),
    );
  }

  getItemSubscriptionByTransactionId(transactionId): Observable<any | undefined> {
    return this.apiService.getById('subscription/get-item-by-transactionId', transactionId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of(false);
      }),
    );
  }

  getAllPlansList(): Observable<any | undefined> {
    return this.apiService.progressiveGetWithoutId('plans').pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  createNewPlan(plansData: any): Observable<any> {
    return from(this.apiService.create('plans/new', plansData)).pipe(
      map((resp) => {
        return resp;
      }),
      catchError((error) => of({ error })),
    );
  }

  async getPlansStatistics(): Promise<any> {
    try {
      const response = await this.apiService
        .getWithoutId('plans/get-statistics')
        .toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }

  async checkSbscriberStatus(planId: string, userId?): Promise<any> {
    try {
      let response: any;
      if (userId) {
        response = await this.apiService
          .getById('subscription/verify-with-user', planId + 'AAA' + userId)
          .toPromise();
      } else {
        response = await this.apiService
          .getById('subscription/verify', planId)
          .toPromise();
      }
      return response;
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }

  addSubscriber(data: any): Observable<any> {
    return from(this.apiService.create('plans/add-subscriber', data)).pipe(
      map((resp) => {
        return resp;
      }),
      catchError((error) => of({ error })),
    );
  }

  getSubscriptionItems(subscriptionId, subscriberId): Observable<any> {
    return this.apiService.getById('subscription/get-items', subscriptionId + 'AAA' + subscriberId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching subscription item:', error);
        return of([]);
      }),
    );
  }
}
