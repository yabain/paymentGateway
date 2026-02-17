import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language/language.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-api-doc',
  templateUrl: './api-doc.component.html',
  styleUrls: ['./api-doc.component.scss'],
})
export class ApiDocComponent implements OnInit {
  selectedSection = 'intro'
  frontUrl: string = environment.frontUrl;
  // en = [{ name: 'lang.en', value: 'en', flagImage: 'assets/icons/uk-flag.svg' }];
  // fr = [{ name: 'lang.fr', value: 'fr', flagImage: 'assets/icons/fr-flag.svg' }];

  en: any = '';
  fr: any = '';
  selectedLanguage: any = '';
  changingLang: boolean = false;

  constructor(
    private router: Router,
    private language: LanguageService,
    private translate: TranslateService,
    private toastService: ToastService,
  ) {
    this.getLanguage();
    this.en = this.language.en;
    this.fr = this.language.fr;
  }

  ngOnInit(): void {
    this.scrollToTop();
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }

  async getLanguage() {
    this.selectedLanguage = await this.language.getDefaultLanguage();
    this.selectedLanguage = this.selectedLanguage === 'en' ? this.en : this.fr;
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  useLanguage(lang) {
    this.changingLang = true;
    this.language.useLanguage(lang);
    this.getLanguage();
    this.changingLang = false;
  }

  navigateTo(url) {
    this.router.navigate([url]);
  }
}
