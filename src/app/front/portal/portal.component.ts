import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
})
export class PortalComponent {
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private language: LanguageService,
  ) {}
  
  ngOnInit(): void {
    this.verifyUser();
  }

  verifyUser() {
    const user = this.userService.getCurrentUserData()
    .then((user: any) => {
      console.log('user', user);
    })
    .catch((e) => {
      this.loading = false;
      const err = e.error.message.message;
      console.error('error to login: ', e.error.message.message)
    });
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

}
