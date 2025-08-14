import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { SystemService } from 'src/app/services/system/system.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language/language.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})

export class TermsComponent implements OnInit {
  appVersion: string;
  currentLanguage: string;
  activeTab: string = 'terms';
  consentPreferences = {
    marketing: false,
    analytics: false,
    calendar: false
  };

  constructor(
    private _location: Location,
    private systemService: SystemService,
    private language: LanguageService,
    private translate: TranslateService,
    private router: Router,
    private toastService: ToastService,
    private storage: StorageService
  ) {
    this.appVersion = this.systemService.appVersion;
  }

  ngOnInit() {
    this.loadConsentPreferences();
    this.storage.getStorage("language")
    .then(res => {
      if(res){
        this.currentLanguage = res;
        this.language.useLanguage(res);
      } else {
        this.currentLanguage = "en";
      }
    })
  }

  async loadConsentPreferences() {
    const preferences = await this.storage.getStorage('consent_preferences');
    if (preferences) {
      this.consentPreferences = JSON.parse(preferences);
    }
  }

  async saveConsentPreferences() {
    await this.storage.setStorage('consent_preferences', JSON.stringify(this.consentPreferences));
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  async acceptAll() {
    this.consentPreferences = {
      marketing: true,
      analytics: true,
      calendar: true
    };
    await this.saveConsentPreferences();
    this.translate.get('terms.consentAccepted').subscribe((message: string) => {
      this.toastService.presentToast('success', 'Accepted !',message);
    });
    setTimeout(() => {
      this.backClicked();
    }, 1000)
  }

  async rejectAll() {
    this.consentPreferences = {
      marketing: false,
      analytics: false,
      calendar: false
    };
    await this.saveConsentPreferences();
    this.translate.get('terms.consentRejected').subscribe((message: string) => {
      this.toastService.presentToast('error', 'Rejected!', message);
    });
    // setTimeout(() => {
    //   this.navigateTo('/tabs/home');
    // }, 1000)
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  async toggleConsent(type: keyof typeof this.consentPreferences) {
    this.consentPreferences[type] = !this.consentPreferences[type];
    await this.saveConsentPreferences();
  }

  backClicked() {
    this._location.back();
  }

  isActiveTab(tab: string): boolean {
    return this.activeTab === tab;
  }
}
