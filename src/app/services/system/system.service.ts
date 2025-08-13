import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { ToastService } from '../toast.service';
import { LocationService } from '../location/location.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';

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
    this.getStaticData();
  }

  async getRacineToshare(): Promise<string> {
    let systemData: any = await this.storage.getStorage('systemData');
    if (systemData?.value) {
      systemData = JSON.parse(systemData.value);
      return systemData.racineLink;
    } else {
      // Await the observable and return the racineLink if available
      try {
        const resp = await this.getSystemData().pipe(take(1)).toPromise();
        if (resp && resp[0] && resp[0].racineLink) {
          return resp[0].racineLink;
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

    if (taxe?.value) {
      taxe = JSON.parse(taxe.value);
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
        if (res) {
          this.storage.setStorage('systemData', JSON.stringify(res));
          return res;
        }
      }),
    );
  }

  async comparAppVersion() {
    let version = environment.appVersion;
    // console.log('local appVersion: ', version);
    this.checkIfNeedToUpdate();

    // if (this.plateforme == "web") {
    //   if (version) {
    //     this.checkIfNeedToUpdate();
    //   } else if (version == undefined || !version || version == null) {
    //     this.getAppVersion()
    //       .subscribe(resp => {
    //         version = this.appVersion = resp; // Assigne la version récupérée à 'version'
    //         console.log('App Version:', this.appVersion);
    //         this.checkIfNeedToUpdate(version);
    //         return false
    //       })
    //       , (error => {
    //         console.error("Error to get version :", error);
    //       });
    //   }
    // } else if (this.plateforme == "mobile") {
    //   version = environment.appVersion;
    // }
  }

  checkIfNeedToUpdate(): Observable<boolean> {
    let version = environment.appVersion;
    // console.log('version local', version);
    return this.getSystemData().pipe(
      map((response: any) => {
        if (!response) {
          console.error('Error to get version:');
          this.availableUpdate.next(false);
          return false;
        }

        this.storage.setStorage('systemData', JSON.stringify(response[0]));
        // console.log(`online appVersion: ${response[0].appVersion}`);
        if (response[0].appVersion !== version) {
          this.availableUpdate.next(true);
          if (this.plateforme === 'web') {
            this.translate
              .get('update.updateMessage')
              .subscribe((res: string) => {
                this.toastService.presentToast(res, 'top', 'warning', 7000);
              });
            version = response.appVersion; // Mise à jour de la version

            setTimeout(() => {
              this.storage.clearStorage();
              location.reload();
            }, 12000);
          } else if (this.plateforme === 'mobile') {
            // Logic for mobile
          }
          this.availableUpdate.next(true);
          return true; // Mise à jour disponible
        } else {
          this.availableUpdate.next(false);
          return false; // Pas de mise à jour nécessaire
        }
      }),
      catchError((error) => {
        console.error('Error to get version:', error);
        this.availableUpdate.next(false);
        return of(false); // Retourne un Observable de `false` en cas d'erreur
      }),
    );
  }

  async getStaticData() {
    let countriesData: any = await this.storage.getStorage(
      environment.countries_data,
    );
    console.log('Loading static data... ', countriesData);
    if (countriesData && countriesData.length >= 3) {
      countriesData = JSON.parse(countriesData);
      this.countriesList.next(countriesData);
    } else {
      console.log('No countries data');
      this.locationService.getCountries().subscribe((countries) => {
        if (countries) {
          this.countriesList.next(countriesData);
        } else {
          console.log('No Countries');
          this.countriesList.next(false);
        }
      });
    }

    let citiesData: any = await this.storage.getStorage(
      environment.cities_data,
    );
    if (citiesData && citiesData.length >= 2) {
      citiesData = JSON.parse(citiesData);
      this.citiesList.next(citiesData);
    } else {
      console.log('No cities data');
      this.locationService.getCities().subscribe((cities) => {
        if (cities) {
          this.citiesList.next(citiesData);
        } else {
          this.citiesList.next(false);
          console.log('No cities data');
        }
      });
    }

    let systemData: any = await this.storage.getStorage('systemData');
    if (systemData.value) {
      systemData = JSON.parse(systemData.value);
      this.systemData.next(systemData);
    } else {
      // console.log("No system data");
      this.getSystemData().subscribe((systemData) => {
        // console.log("systemData: ", systemData);
        if (systemData) {
          this.storage.setStorage('systemData', JSON.stringify(systemData[0]));
          this.systemData.next(systemData[0]);
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
