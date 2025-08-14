import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { routes } from 'src/app/core/core.index';
import { AuthService } from 'src/app/services/auth/auth.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent implements OnInit {

  form: FormGroup;
  type = true; // Used to toggle password visibility
  isSending: boolean = false;
  isLoading: boolean = true;
  userId: string;
  token: string;
  success: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
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
      console.log('les params: ', datas);
      this.getIfIsConnected()
        .then((response) => {
          console.log('resp: ', response)
          if (response === true) {
            this.router.navigateByUrl('/tabs', { replaceUrl: true });
          } else {
            this.initForm();
            console.log('params.token: ', datas.params.token)
            if(datas.params.token){
              this.verityToken(datas.params.token);
            }
            // else this.router.navigateByUrl('/tabs', { replaceUrl: true });
          }
        });

    })
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
      password: new FormControl(null, { validators: [Validators.required, Validators.email] }),
      password2: new FormControl(null, { validators: [Validators.required, Validators.email] }),
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
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.value.password != this.form.value.password2){
      this.toastService.presentToast('Verify your form', 'top', 'warning')
      return;
    }

    this.isSending = true;
    const data = {
      password: this.form.value.password,
      token: this.token
    }

    this.authService.resetPassword(data)
      .pipe(
        catchError(error => {
          console.error('Password reset error:', error);
          if (error.status === 404) {
            this.translate.get("auth.unknowEmail").subscribe((res: string) => {
              this.toastService.presentToast(res, 'top', 'danger', 10000);
            });
          } else this.translate.get("auth.unableResetPwd").subscribe((res: string) => {
            this.toastService.presentToast(res, 'top', 'danger');
          });
          this.isSending = false;
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res === true) {
          this.toastService.presentToast('Success !', 'top', 'success', 5000);
          // this.router.navigateByUrl('/auth-screen', { replaceUrl: true });
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
    return isAuth.value ? true : false;
  }

  /**
   * Displays an alert with a given message
   * @param message - The message to display in the alert
   */
  async showAlert(message: string) {
    let msg = "";
    this.translate.get("auth.authenticationFailed").subscribe((res: string) => {
      msg = res;
    })
    const alert = await this.alertController.create({
      header: msg,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Navigates to the login screen
   */
  navigateTo(route: string) {
    this.router.navigateByUrl(route, { replaceUrl: true })
  }

  verityToken(token){
    this.authService.verifyResetPwdToken(token)
    .pipe(
      catchError(error => {
        console.error('Token error:', error);
        if (error.status === 400) {
          this.translate.get("auth.requestExpired").subscribe((res: string) => {
            this.toastService.presentToast('error', 'Link Expired', res, 10000);
          });
        } else this.translate.get("auth.unableResetPwd").subscribe((res: string) => {
            this.toastService.presentToast('error', 'An error occurred', res, 10000);
        });
        this.isLoading = false;
        this.navigateTo('/welcome');
        return of(null);
      })
    )
    .subscribe((data: any) =>{
      console.log('userId:', data.userId)
      this.userId = data.userId;
      this.token = token;
      this.isLoading = false;
    })
  }
}
