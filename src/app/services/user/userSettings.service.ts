import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api/api.service';



@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  constructor(
    private router: Router,
    private storage: StorageService,
    private authService: AuthService,
    private apiService: ApiService
  ) {

  }

  async getLocalUserSetting() {
    try {
      let userSettings: any = await this.storage.getStorage(environment.user_settings || 'dk_user_settings');
      return userSettings ? JSON.parse(userSettings) : undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async setUserLocal(userSettings: any) {
    try {
      await this.storage.setStorage(environment.user_settings || 'dk_user_settings', JSON.stringify(userSettings));
    } catch (e) {
      console.error(e);
    }
  }

  updateSettingsData(userSettings: any): Observable<any> {
    try {
      return this.apiService.updateWithoutId(`userSettings/update-items`, userSettings);
    } catch (e) {
      console.error("Error setting user data:", e);
      throw e;
    }
  }

  getUserSettings(): Observable<any> {
    return from(this.apiService.getWithoutId(`userSettings/get`))
      .pipe(
        map((resp) => {
          this.setSettingsToStorage(resp);
          return resp;
        }),
        catchError(error => {
          return of({ error: true, message: error.message || 'An error occurred' });
        })
      );
  }

  setUserSetting(userSettings?): Observable<any> {
    if (!userSettings) userSettings = this.getSettingsFromStorage();
    console.log('userSettings: ', userSettings);
    return from(this.apiService.update(`userSettings/update`, 'null', userSettings))
      .pipe(
        map((resp) => {
          // this.setSettingsToStorage(resp);
          return resp;
        }),
        catchError(error => {
          return of({ error: true, message: error.message || 'An error occurred' });
        })
      );
  }
  
  resetUserSetting(): Observable<any> {
    const userSettings = {
      layoutPosition: 1,
      layoutColor: 1,
      layoutTopColor: 1,
      layoutSidebarColor: 1,
      layoutWidth: 1,
      layoutPositionScroll: 1,
      layoutSidebarSize: 1,
      layoutSidebarView: 2
    };
    return from(this.setUserSetting(userSettings))
    .pipe(
      map((resp) => {
        // this.setSettingsToStorage(resp);
        return resp;
      }),
      catchError(error => {
        return of({ error: true, message: error.message || 'An error occurred' });
      })
    );
  }

  setSettingsToStorage(userSettings) {
    this.storage.setStorage('layoutPosition', JSON.stringify(userSettings.layoutPosition));
    this.storage.setStorage('layoutColor', JSON.stringify(userSettings.layoutColor));
    this.storage.setStorage('layoutTopColor', JSON.stringify(userSettings.layoutTopColor));
    this.storage.setStorage('layoutSidebarColor', JSON.stringify(userSettings.layoutSidebarColor));
    this.storage.setStorage('layoutWidth', JSON.stringify(userSettings.layoutWidth));
    this.storage.setStorage('layoutPositionScroll', JSON.stringify(userSettings.layoutPositionScroll));
    this.storage.setStorage('layoutSidebarSize', JSON.stringify(userSettings.layoutSidebarSize));
    this.storage.setStorage('layoutSidebarView', JSON.stringify(userSettings.layoutSidebarView));
    this.storage.setStorage('portal', JSON.stringify(userSettings.portal));
    this.storage.setStorage('portalServices', JSON.stringify(userSettings.portalServices));
    this.storage.setStorage('portalSubscription', JSON.stringify(userSettings.portalSubscription));
    this.storage.setStorage('portalFundraising', JSON.stringify(userSettings.portalFundraising));
    this.storage.setStorage('headTitlePortal', JSON.stringify(userSettings.headTitlePortal));
    this.storage.setStorage('headTextPortal', JSON.stringify(userSettings.headTextPortal));
    this.storage.setStorage('headTitlePortalColor', JSON.stringify(userSettings.headTitlePortalColor));
    this.storage.setStorage('headTextPortalColor', JSON.stringify(userSettings.headTextPortalColor));
  }

  getSettingsFromStorage() {
    const userSettings = {
      layoutPosition: JSON.parse(localStorage.getItem('layoutPosition')),
      layoutColor: JSON.parse(localStorage.getItem('layoutColor')),
      layoutTopColor: JSON.parse(localStorage.getItem('layoutTopColor')),
      layoutSidebarColor: JSON.parse(localStorage.getItem('layoutSidebarColor')),
      layoutWidth: JSON.parse(localStorage.getItem('layoutWidth')),
      layoutPositionScroll: JSON.parse(localStorage.getItem('layoutPositionScroll')),
      layoutSidebarSize: JSON.parse(localStorage.getItem('layoutSidebarSize')),
      layoutSidebarView: JSON.parse(localStorage.getItem('layoutSidebarView'))
    };
    return userSettings;
  }
}
