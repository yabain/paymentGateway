import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { UserService } from 'src/app/services/user/user.service';
import { UserSettingsService } from 'src/app/services/user/userSettings.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
})
export class PortalComponent {
  frontUrl: string = environment.frontUrl;
  loading: boolean = true;
  loadingSettings: boolean = true;
  gettingUserData: boolean = true;
  userData: any;
  userId!: string;
  cover: string = "../../../assets/img/ressorces/cover.png";
  currentUser: any;
  en: any = '';
  fr: any = '';
  selectedLanguage: any = '';
  userSettings: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private language: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
    private userSettingsService: UserSettingsService,
  ) {
    this.getLanguage();
    this.en = this.language.en;
    this.fr = this.language.fr;
  }
  
  ngOnInit(): void {
    this.verifyUser();
    this.getId();
  }

  verifyUser() {
    const user = this.userService.getCurrentUserData()
    .then((user: any) => {
      this.currentUser = user;
    })
    .catch((e) => {
      const err = e.error.message.message;
      console.error('error to login: ', e.error.message.message)
    });
  }

  getId() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'null' && idParam !== 'undefined') {
      this.userId = idParam;
      this.getUserData(idParam);
    } else {
      this.userId = null;
      this.navigateTo('/dashboard');
    }
  }

  async getLanguage() {
    this.selectedLanguage = await this.language.getDefaultLanguage();
    this.selectedLanguage = this.selectedLanguage === 'en' ? this.en : this.fr;
  }

  useLanguage(lang) {
        this.language.useLanguage(lang);
        this.selectedLanguage = lang === 'en' ? this.en : this.fr;
  }

  whatsappUrl(whatsapp) {
    const data = whatsapp.replace(' ', '');
    return `https://wa.me/${data}`;
  }

  getUserData(userId) {
    this.gettingUserData = true;
    this.userService
      .getUser(userId)
      .pipe(
        catchError((error: any) => {
          console.log('error: ', error);
          this.gettingUserData = false;
          this.navigateTo('/dashboard');
          return of({
            error: true,
            message: error.message || 'An error occurred',
          });
        }),
      )
      .subscribe((user: any) => {
        if(user.accountType !== 'organisation' && user.isAdmin !== true || user.isActive !== true || user.portal !== true){
          this.userId = null;
          this.navigateTo('/');
          return;
        }
        this.getUserSettings(userId);
        this.userData = user;
        this.useLanguage(user.language);
        this.gettingUserData = false;
        this.loading = false;
      });
  }

  getUserSettings(userId){
    this.loadingSettings = true;
    this.userSettingsService.getUserSettings(userId).subscribe((res: any) => {
      console.log('res settings: ', res)
      if(!res || res.portal !== true){
          this.userId = null;
          this.navigateTo('/');
          return;
      }
      console.log('user settings:', res)
      this.userSettings = res;
      this.loadingSettings = false
    })
  }
  
  authAsAnonymous() {
    this.authService.authAsAnonymous()
    .then((res: any) => {
      console.log('res', res);
      if (res) {
        this.userService.setCurrentUser(res);
        this.language.setLocalUserLanguage(res.language);
        this.language.useLanguage(res.language);
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
    .catch((e) => {
      this.loading = false;
      const err = e.error.message.message;
      console.error('error to login: ', e.error.message.message)
    });
  }

  showName(userData){
    return this.userService.showName(userData);
  }

  navigateTo(route: string){
    return this.router.navigate([route]);
  }

}
