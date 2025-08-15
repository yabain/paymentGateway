import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { LocationService } from '../location/location.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  // appName = 'Yabi_Events.apk';
  appVersion = environment.appVersion;
  plateforme: string = environment.plateforme;
  currentDate = new Date();
  availableUpdate = new BehaviorSubject<boolean>(false);
  categoriesList = new BehaviorSubject<any>(false);
  countriesList = new BehaviorSubject<any>(false);
  citiesList = new BehaviorSubject<any>(false);
  systemData = new BehaviorSubject<any>(false);

  constructor(
    private storage: StorageService,
    private authService: AuthService,
    private toastService: ToastService,
    private translate: TranslateService,
    private locationService: LocationService,

    private apiService: ApiService,
  ) {
  }

  async getRacineToshare(): Promise<string> {
    let systemData: any = await this.storage.getStorage('systemData');
    if (systemData) {
      systemData = JSON.parse(systemData);
      return systemData.racineLink;
    } else {
      try {
        const resp = await this.getSystemData().pipe(take(1)).toPromise();
        if (resp && resp.racineLink) {
          return resp.racineLink;
        } else {
          return '';
        }
      } catch (error) {
        return '';
      }
    }
  }

  async getInvoiceTaxes(): Promise<number> {
    let taxe: any = await this.storage.getStorage('systemData');

    if (taxe) {
      taxe = JSON.parse(taxe);
      console.log('taxes', taxe.invoiceTaxes);
      return Number(taxe.invoiceTaxes);
    } else {
      try {
        const systemData = await this.getSystemData().toPromise();
        this.getStaticData();
        return Number(systemData.invoiceTaxes);
      } catch (error) {
        console.error('Error fetching system data:', error);
        throw new Error('Failed to fetch system data');
      }
    }
  }

  // Id random generation
  generateUniqueId(type) {
    return (
      this.currentDate.toISOString().split('.')[0] +
      '-' +
      type +
      '-' +
      this.getRandomPaires(2)
    );
  }

  //Génération aléatoire des @parts groupes de 4 caractères
  getRandomPaires(parts: number): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      const S4 = (((1 + Math.random()) * 0x10000) | 0)
        .toString(16)
        .substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  getSystemData(): Observable<any | undefined> {
    return this.apiService.get(`system`).pipe(
      map((res: any) => {
        // console.log('getSystemData: ', res[0]);
        if (res) {
          this.storage.setStorage('systemData', JSON.stringify(res[0]));
          return res[0];
        }
      }),
    );
  }

  async getStaticData(): Promise<any> {
    this.locationService.getCountries().subscribe((countries) => {
      if (countries) {
        this.countriesList.next(countries);
      } else {
        this.countriesList.next(false);
        // console.log('No countries data');
      }
    });

    this.locationService.getCities().subscribe((cities) => {
      if (cities) {
        this.citiesList.next(cities);
      } else {
        this.citiesList.next(false);
        // console.log('No cities data');
      }
    });

    let systemData: any = await this.storage.getStorage('systemData');
    // console.log('systemData 00: ', systemData);
    if (systemData) {
      // console.log('systemData 11: ', systemData);
      this.systemData.next(systemData);
    } else {
      // console.log('No system data');
      this.getSystemData().subscribe((systemData) => {
        console.log('systemData: ', systemData);
        if (systemData) {
          // console.log('systemData 11: ', systemData);
          this.systemData.next(systemData);
        } else {
          this.systemData.next(false);
          // console.log("No systemData data");
        }
      });
    }

    if (
      this.countriesList &&
      this.citiesList &&
      this.categoriesList &&
      this.systemData
    )
      return systemData;
    else return {};
  }
}
