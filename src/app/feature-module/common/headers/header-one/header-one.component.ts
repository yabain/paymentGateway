import { Component, OnInit } from '@angular/core';
import { an } from '@fullcalendar/core/internal-common';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';

import { routes } from 'src/app/core/core.index';
import { SideBarService } from 'src/app/core/services/side-bar/side-bar.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss'],
})
export class HeaderOneComponent implements OnInit {
  currentUserData: any = [];
  userName: string = 'User';
  changingLang: boolean = false;
  public miniSidebar = false;
  public headerSidebarStyle = '1';
  public routes = routes;
  elem = document.documentElement;
  en: any = '';
  fr: any = '';
  selectedLanguage: any = '';

  constructor(
    private auth: AuthService,
    private sideBar: SideBarService,
    private storage: StorageService,
    private translate: TranslateService,
    private userService: UserService,
    private language: LanguageService,
    private toastService: ToastService,
  ) {
    this.getLanguage();
    this.en = this.language.en;
    this.fr = this.language.fr;
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    this.sideBar.headerSidebarStyle.subscribe((res: string) => {
      this.headerSidebarStyle = res;
    });
  }

  ngOnInit(): void {
    this.getUserData();
  }

  async getLanguage(){
    this.selectedLanguage = await this.language.getDefaultLanguage();
    this.selectedLanguage = this.selectedLanguage === 'en' ? this.en : this.fr;
  }

  public logOut(): void {
    this.auth.logout();
  }

  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

  public toggleMobileIcon(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  async getUserData() {
    this.currentUserData = await this.userService.getCurrentUserData();
    // this.userData = await this.storage.getStorage(environment.user_data);
    if (this.currentUserData) {
      this.userName = this.userService.showName(this.currentUserData);
    }
  }

  useLanguage(lang) {
    this.changingLang = true;

    this.userService
      .updateUserProfile({ language: lang })
      .pipe(
        catchError((error) => {
          this.toastService.presentToast('error', 'Error', error);
          console.error('Error updating your language:', error);
          this.changingLang = false;
          return of(null);
        }),
      )
      .subscribe(() => {
        this.currentUserData.language = lang;
        this.language.useLanguage(lang);
        this.currentUserData.language = lang;
        this.userService.setCurrentUser(this.currentUserData);
        // this.translate.get('lang.langChanged').subscribe((res: string) => {
        // this.toastService.presentToast(res, 'top', 'success');
        // });
        this.getLanguage();
        this.changingLang = false;
      });
  }

  fullscreen() {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
