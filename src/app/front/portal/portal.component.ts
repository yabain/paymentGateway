import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
})
export class PortalComponent {
  loading: boolean = true;
  gettingUserData: boolean = true;
  userData: any;
  userId!: string;
  cover: string = "../../../assets/img/ressorces/cover.png";
  currentUser: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private language: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  
  ngOnInit(): void {
    this.verifyUser();
    this.getId();
  }

  verifyUser() {
    const user = this.userService.getCurrentUserData()
    .then((user: any) => {
      console.log('user', user);
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
      this.router.navigate(['/dashboard']);
    }
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
          this.router.navigateByUrl('/dashboard');
          return of({
            error: true,
            message: error.message || 'An error occurred',
          });
        }),
      )
      .subscribe((user: any) => {
        if(user.accountType !== 'organisation' && user.isAdmin !== true || user.isActive === false){
          this.userId = null;
          this.router.navigate(['/']);
        }
        this.userData = user;
        console.log('userData: ', this.userData)
        this.gettingUserData = false;
        this.loading = false;
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

  showName(userData){
    return this.userService.showName(userData);
  }

}
