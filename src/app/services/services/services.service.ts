import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  constructor(
    private storage: StorageService,

    private apiService: ApiService,
  ) {}

  // For admin only
  getServiceStatistics(): Observable<any | undefined> {
    return this.apiService.getWithToken('service/get-statistics').pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  getMyServiceStatistics(): Observable<any | undefined> {
    return this.apiService.getWithToken('service/get-my-statistics').pipe(
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
        .update('service/update-status', planId, {})
        .toPromise();
      return response;
    } catch (error) {
      console.error('Error to change plan status:', error);
      throw error;
    }
  }

  async deleteService(planId): Promise<any> {
    try {
      const response = await this.apiService
        .delete('service/delete', planId)
        .toPromise();
      return response;
    } catch (error) {
      console.error('Error to delete plan: ', error);
      throw error;
    }
  }

  getMyServicesList(userId): Observable<any | undefined> {
    return this.apiService.getById('service/planList', userId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  updateServicePicture(serviceId: string, imageFile?: File): Observable<any> {
    const data = new FormData();
    if (imageFile) {
      data.append('pictureFile', imageFile);
    } else {
      return of({ error: true, message: 'No file provided' });
    }

    return from(this.apiService.uploadPicture('service/picture/' + serviceId, data)).pipe(
      catchError(error => {
        return of({ error: true, message: error.message || 'An error occurred: update user\'s picture' });
      })
    );
  }

  getPayersList(planId): Observable<any> {
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

  getMyServicesData(planId): Observable<any | undefined> {
    return this.apiService.getById('service/get-data', planId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of(false);
      }),
    );
  }

  getAllServicesList(userId): Observable<any | undefined> {
    return this.apiService.progressiveGetWithId('service', userId).pipe(
      map((data) => {
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching plan statistics:', error);
        return of([]);
      }),
    );
  }

  createNewService(serviceData: any): Observable<any> {
    return from(this.apiService.create('service/new', serviceData)).pipe(
      map((resp) => {
        return resp;
      }),
      catchError((error) => of({ error })),
    );
  }

  async getServicesStatistics(): Promise<any> {
    try {
      const response = await this.apiService
        .getWithoutId('service/get-statistics')
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
    return from(this.apiService.create('service/add-subscriber', data)).pipe(
      map((resp) => {
        return resp;
      }),
      catchError((error) => of({ error })),
    );
  }
}
