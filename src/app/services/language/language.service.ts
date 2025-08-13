import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    selectedDate = new Date();
    formattedDate: string;

    constructor(
        private translate: TranslateService,
        private storage: StorageService,
        private datePipe: DatePipe
    ) {
        this.translate.setDefaultLang('en');
        this.translate.onLangChange.subscribe((event) => {
            const dateFormat = this.translate.instant('DATE_FORMAT');
            this.formattedDate = this.datePipe.transform(this.selectedDate, dateFormat, undefined, event.lang);
        });

        this.translate.addLangs(['en', 'en']);
        // Switch language based on user preference
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');

    }

    currentLanguage!: { name: string, value: string, flagImage: string };


    setDefaultLanguage() {
        // console.log("setDefaultLanguage - no lan")
        this.translate.setDefaultLang('en');
        this.setLocalUserLanguage('en');
        this.useLanguage('en');
        return "en"
    }

    setLocalUserLanguage(lang) {
        console.log("setLocalUserLanguage", lang);
        this.storage.setStorage("language", lang);
    }

    getDefaultLanguage(){
        return this.storage.getStorage("language")
            .then((lang: any) => {
                if (lang) {
                    // this.setLocalUserLanguage(lang);
                    return lang;
                }
                else {
                    this.setLocalUserLanguage('en');
                    return "en";
                }
            })
    }

    useLanguage(language: any) {
        this.translate.use(language);
        this.storage.setStorage("language", language);
        this.currentLanguage = language;
    }

    initLanguage() {
        this.storage.getStorage('language')
            .then((res: any) => {
                if (res) {
                    if (res) {
                        // this.setLocalUserLanguage(res);
                        this.translate.use(res);
                        return res;
                    } else return this.setDefaultLanguage();
                } else {
                    // console.log("initLanguage - no res")
                    return this.setDefaultLanguage();
                }
            })
    }

    switchLanguage(lang: string) {
        this.translate.use(lang);
    }
}
