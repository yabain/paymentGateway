import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { routes } from 'src/app/core/core.index';
import { AuthService } from 'src/app/services/auth/auth.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent implements OnInit {
  public routes = routes;
  form: FormGroup;
  type = true; // Used to toggle password visibility
  isSending: boolean = false;
  isLoading: boolean = false;
  isBadToken: boolean = true;
  userId: string;
  token: string;
  success: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private userService: UserService,
    private translate: TranslateService,
    private toastService: ToastService,
  ) {
    this.initForm();
  }

  /**
   * Initializes the component and checks if the user is already connected
   */
  ngOnInit() {
    this.route.paramMap.subscribe((datas: any) => {
      this.isLoading = true;
      if (!datas.params.id) {
        this.router.navigateByUrl('/welcome', { replaceUrl: true });
        return;
      }

      this.token = datas.params.id;
      console.log('params token: ', this.token);
      this.getIfIsConnected().then((response) => {
        console.log('resp: ', response);
        if (response === true) {
          this.router.navigateByUrl('/tabs', { replaceUrl: true });
          this.isLoading = false;
        } else {
          this.initForm();
          this.verityToken(this.token);
        }
      });
    });
  }

  /**
   * Custom formatter for character counter display in the input fields
   * @param inputLength - Current input length
   * @param maxLength - Maximum allowed length
   * @returns The remaining characters count as a string
   */
  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} characters remaining`;
  }

  /**
   * Initializes the reset password form with validation rules
   */
  initForm() {
    this.form = new FormGroup({
      password: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
      password2: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
    });
  }

  /**
   * Toggles the visibility of the password field
   */
  changeType() {
    this.type = !this.type;
  }

  /**
   * Handles form submission to request a password reset email
   */
  onSubmit() {
    if (this.form.value.password != this.form.value.password2) {
      this.toastService.presentToast(
        'error',
        'Not match',
        'The password does not match',
      );
      return;
    }

    this.isSending = true;
    const data = {
      password: this.form.value.password,
      token: this.token,
    };

    this.authService
      .resetPassword(data)
      .pipe(
        catchError((error) => {
          console.error('Password reset error:', error);
          if (error.status === 404) {
            this.translate.get('auth.unknowEmail').subscribe((res: string) => {
              this.toastService.presentToast('error', 'Error', res);
            });
          } else
            this.translate
              .get('auth.unableResetPwd')
              .subscribe((res: string) => {
                this.toastService.presentToast('error', 'Error', res);
              });
          this.isSending = false;
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res === true) {
          this.translate
            .get('auth.passwordUpdated')
            .subscribe((res: string) => {
              this.toastService.presentToast(
                'success',
                'Password updated!',
                res,
                15000,
              );
            });
          this.navigateTo('/auth/login');
          this.isSending = false;
          this.success = true;
        }
      });
  }

  /**
   * Checks if a user is already connected by verifying local storage
   * @returns A promise that resolves to true if the user is authenticated
   */
  async getIfIsConnected(): Promise<boolean> {
    const isAuth = await this.storage.getStorage('dk_user_data');
    return isAuth ? true : false;
  }

  showNotification(type: string, title: string, message: string) {
    this.toastService.presentToast(type, title, message);
  }

  /**
   * Navigates to the login screen
   */
  navigateTo(route: string) {
    this.router.navigateByUrl(route, { replaceUrl: true });
  }

  verityToken(token) {
    this.authService
      .verifyResetPwdToken(token)
      .pipe(
        catchError((error) => {
          console.error('Token error:', error);
          this.translate.get('auth.requestExpired').subscribe((res: string) => {
            this.toastService.presentToast('error', 'Link Expired !', res, 10000);
          });
          this.isBadToken = true;
          this.isLoading = false;
          // this.navigateTo('/welcome');
          return of(null);
        }),
      )
      .subscribe((data: any) => {
        console.log('userId:', data.userId);
        this.userId = data.userId;
        this.isBadToken = false;
        this.isLoading = false;
      });
  }
}
