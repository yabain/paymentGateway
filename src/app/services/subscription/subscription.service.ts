import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(
    private storage: StorageService,

    private apiService: ApiService
  ) {}

  getPlanStatistics(): Observable<any | undefined> {
    return from(this.storage.getStorage(environment.cities_data)).pipe(
      switchMap((citiesData: any) => {
          return this.apiService.getWithToken('plans/get-statistics').pipe(
            map((data) => {
              return data;
            }),
            catchError((error) => {
              console.error('Error fetching plan statistics:', error);
              return of([]);
            }),
          );
      }),
    )
  }
  
  getCountryData(countryId): Promise<any>{
    return this.storage.getStorage(environment.countries_data)
      .then((resp: any) => {
        if (resp.value) {
          let countryData = JSON.parse(resp.value);
          return countryData.filter(data => data.id === countryId);
        }
        else {
          // this.systemService.getStaticData().then(() => {
          //   setTimeout(() => { window.location.reload() }, 5000)
          // })
          return false;
        }
      });
  }
  
  getCityData(cityId): Promise<any>{
   return this.storage.getStorage(environment.cities_data)
      .then((resp: any) => {
        if (resp.value) {
          let cityData = JSON.parse(resp.value);
          return cityData.filter(data => data.id === cityId);
        }
        else {
          // this.systemService.getStaticData().then(() => {
          //   setTimeout(() => { 
          //     this.getCityData(cityId);
          //     window.location.reload(); }, 5000)
          // })
          return false;
        }
      });
  }
}
