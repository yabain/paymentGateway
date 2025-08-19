import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  selectedDate = new Date();
  formattedDate: string;
  en = [{ name: 'lang.en', value: 'en', flagImage: 'assets/icons/uk-flag.svg' }];
  fr = [{ name: 'lang.fr', value: 'fr', flagImage: 'assets/icons/fr-flag.svg' }];

  constructor(
    private translate: TranslateService,
    private storage: StorageService,
  ) {
    this.translate.onLangChange.subscribe((event) => {
      try {
        this.formattedDate = this.formatDate(this.selectedDate, event.lang);
      } catch (error) {
        console.warn('Erreur lors du formatage de la date:', error);
        // Fallback au format par défaut
        this.formattedDate = this.formatDate(this.selectedDate, 'en');
      }
    });

    this.translate.addLangs(['en', 'fr']);
    // Switch language based on user preference
    const browserLang = this.translate.getBrowserLang();
    console.log('browserLang: ', browserLang);
    
    // Vérifier que la langue du navigateur est supportée
    const supportedLang = browserLang && ['en', 'fr'].includes(browserLang) ? browserLang : 'en';
    
    this.translate.setDefaultLang('en');
    this.translate.use(supportedLang);
  }

  /**
   * Formate une date selon la langue spécifiée
   */
  private formatDate(date: Date, lang: string): string {
    try {
      if (lang === 'fr') {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      // Fallback au format ISO si la locale n'est pas supportée
      return date.toISOString().split('T')[0];
    }
  }

  currentLanguage!: { name: string; value: string; flagImage: string };

  setDefaultLanguage() {
    // console.log("setDefaultLanguage - no lan")
    this.translate.setDefaultLang('en');
    this.setLocalUserLanguage('en');
    this.useLanguage('en');
    return 'en';
  }

  setLocalUserLanguage(lang) {
    console.log('setLocalUserLanguage', lang);
    this.storage.setStorage('language', lang);
  }

  getDefaultLanguage() {
    return this.storage.getStorage('language').then((lang: any) => {
      if (lang && ['en', 'fr'].includes(lang)) {
        // this.setLocalUserLanguage(lang);
        return lang;
      } else {
        this.setLocalUserLanguage('en');
        return 'en';
      }
    });
  }

  useLanguage(language: any) {
    if (['en', 'fr'].includes(language)) {
      this.translate.use(language);
      this.storage.setStorage('language', language);
      this.currentLanguage = language;
    } else {
      console.warn(`Langue non supportée: ${language}, utilisation de l'anglais par défaut`);
      this.useLanguage('en');
    }
  }

  initLanguage() {
    this.storage.getStorage('language').then((res: any) => {
      if (res && ['en', 'fr'].includes(res)) {
        if (res) {
          // this.setLocalUserLanguage(res);
          this.translate.use(res);
          return res;
        } else return this.setDefaultLanguage();
      } else {
        // console.log("initLanguage - no res")
        return this.setDefaultLanguage();
      }
    });
  }

  switchLanguage(lang: string) {
    if (['en', 'fr'].includes(lang)) {
      this.translate.use(lang);
    } else {
      console.warn(`Langue non supportée: ${lang}`);
    }
  }
}
