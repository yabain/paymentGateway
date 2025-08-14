import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(
    private storage: StorageService,

    private apiService: ApiService
  ) {}

  getCities(): Observable<any | undefined> {
    return from(this.storage.getStorage(environment.cities_data)).pipe(
      switchMap((citiesData: any) => {
        if (citiesData && citiesData.length >= 2) {
          const parsedData = JSON.parse(citiesData);
          return of(parsedData);
        } else {
          return this.apiService.get('city').pipe(
            take(1),
            map((data) => {
              this.storage.setStorage(environment.cities_data, JSON.stringify(data));
              return data ? data[0] : [];
            }),
            catchError((error) => {
              console.error('Error fetching cities:', error);
              return of([]);
            }),
          );
        }
      }),
    )
  }

  getCountries(): Observable<any | undefined> {
    return from(this.storage.getStorage(environment.countries_data)).pipe(
      switchMap((countriesData: any) => {
        if (countriesData && countriesData.length >= 2) {
          const parsedData = JSON.parse(countriesData);
          return of(parsedData);
        } else {
          return this.apiService.get('country/available-countries').pipe(
            take(1),
            map((data) => {
              this.storage.setStorage(environment.countries_data, JSON.stringify(data));
              return data ? data[0] : [];
            }),
            catchError((error) => {
              console.error('Error fetching country:', error);
              return of([]);
            }),
          );
        }
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
