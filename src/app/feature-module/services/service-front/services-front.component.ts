import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LanguageService } from 'src/app/services/language/language.service';

@Component({
  selector: 'app-services-front',
  templateUrl: './services-front.component.html',
  styleUrls: ['./services-front.component.scss']
})
export class ServicesFrontComponent implements OnInit {
  votedId: string | null = null;
  processingVote = false;
  toastMessage = '';
  url: string = '';
  idParam: string | null = null;
  isAdminRoute: boolean = false;
  loading: boolean = true;


  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private language: LanguageService,
  ) {}

  ngOnInit(): void {
    this.verifyUser();
  }



  getId() {
    this.url = this.location.path();
    this.isAdminRoute = this.url.includes('admin-services');

    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('idParam', idParam);

    if (idParam && idParam !== 'null' && idParam !== 'undefined') {
      this.idParam = idParam;
    }
  }

  verifyUser() {
    const user = this.userService.getCurrentUserData()
    .then((user: any) => {
      console.log('user', user);
      if (user) {
        this.loading = false;
      } else this.authAsAnonymous();
    })
    .catch((e) => {
      this.loading = false;
      const err = e.error.message.message;
      console.error('error to login: ', e.error.message.message)
    });
  }


  authAsAnonymous() {
    return this.authService.authAsAnonymous()
    .then((user: any) => {
      console.log('user', user);
      if (user) {
          this.userService.setCurrentUser(user);
          this.language.setLocalUserLanguage(user.language);
          this.language.useLanguage(user.language);
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
