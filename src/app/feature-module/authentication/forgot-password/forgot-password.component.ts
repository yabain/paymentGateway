import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { routes } from 'src/app/core/core.index';
import { AuthService } from 'src/app/services/auth/auth.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent  implements OnInit {
  public routes = routes;

  form: FormGroup;
  type = true; // Used to toggle password visibility
  isLoading: boolean = false;
  emailSended: boolean = false;
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    // private alertController: AlertController,
    private storage: StorageService,
    private userService: UserService,
    private translate: TranslateService,
    private systemService: SystemService
  ) {
    this.initForm();
  }

  /**
   * Initializes the component and checks if the user is already connected
   */
  ngOnInit() {
    this.getIfIsConnected()
      .then((response) => {
        if (response === true) {
          this.router.navigateByUrl('/tabs', { replaceUrl: true });
        }
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
   * Initializes the login form with validation rules
   */
  initForm() {
    this.form = new FormGroup({
      email: new FormControl(null, { validators: [Validators.required, Validators.email] }),
    });
  }

  /**
   * Toggles the password field's visibility
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

    this.isLoading = true;

    this.authService.sendPasswordResetEmail(this.form.value.email)
      .pipe(
        catchError(error => {
          console.error('Password reset error:', error);
          if (error.status === 404){
            this.translate.get("auth.unknowEmail").subscribe((res: string) => {
              // this.toastService.presentToast(res, 'top', 'danger', 10000);
            });
          } else this.translate.get("auth.unableResetPwd").subscribe((res: string) => {
            // this.toastService.presentToast(res, 'top', 'danger');
          });
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res === true) {
          this.translate.get("auth.resetLinkSend").subscribe((res: string) => {
            // this.toastService.presentToast(res, 'top', 'success', 15000);
          });
          this.emailSended = true;
          this.email = this.form.value.email;
          // this.router.navigateByUrl('/auth-screen', { replaceUrl: true });
          this.isLoading = false;
        }
      });
  }

  /**
   * Checks if a user is already connected by checking local storage
   * @returns A promise that resolves to true if the user is authenticated
   */
  async getIfIsConnected(): Promise<boolean> {
    const isAuth = await this.storage.getStorage(environment.user_data);
    return isAuth ? true : false;
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
    // const alert = await this.alertController.create({
    //   header: msg,
    //   message,
    //   buttons: ['OK'],
    // });
    // await alert.present();
  }

  /**
   * Navigates to the forgot password screen
   */
  navigateToForgotPassword() {
    this.router.navigate(['/auth/reset-password']);
  }

  /**
   * Navigates to the home screen
   */
  navigateToHome() {
    this.router.navigate(['/tabs']);
  }
}
