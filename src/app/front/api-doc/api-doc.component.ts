import { Component } from '@angular/core';
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
export class ApiDocComponent {
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
  
  selectSection(section: string){
    this.selectedSection = section;
  }

  async getLanguage() {
    this.selectedLanguage = await this.language.getDefaultLanguage();
    this.selectedLanguage = this.selectedLanguage === 'en' ? this.en : this.fr;
  }

  useLanguage(lang) {
    this.changingLang = true;

        this.language.useLanguage(lang);
        // this.translate.get('lang.langChanged').subscribe((res: string) => {
        //   this.toastService.presentToast('success', 'Done!', res, 2000);
        // });
        this.getLanguage();
        this.changingLang = false;
  }

  navigateTo(url){
    this.router.navigate([url]);
  }
}
