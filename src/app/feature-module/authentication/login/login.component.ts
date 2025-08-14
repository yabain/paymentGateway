import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { routes } from 'src/app/core/core.index';
import { AuthService } from 'src/app/services/auth/auth.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent  implements OnInit {
  public routes = routes;

  form: FormGroup;
  type = true; // Used to toggle password visibility
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    // private alertController: AlertController,
    private storage: StorageService,
    private userService: UserService,
    private translate: TranslateService,
    private systemService: SystemService,
    private toastService: ToastService
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
      password: new FormControl(null, { validators: [Validators.required, Validators.minLength(8)] })
    });
  }

  /**
   * Toggles the password field's visibility
   */
  changeType() {
    this.type = !this.type;
  }

  /**
   * Handles form submission for user login
   */
  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.login(this.form.value)
      .then((user: any) => {
            console.log("onSubmit: ", user);
        if (user) {
          if (user === false) {
            console.log("onSubmit false");
            this.translate.get("auth.errorCredential").subscribe((res: string) => {
              this.isLoading = false;
              this.showAlert(res);
              return;
            })
          }
          if (user.active === false) {
            console.log("onSubmit active");
            this.isLoading = false;
            this.translate.get("auth.desabledAccountMsg").subscribe((res: string) => {
              this.showAlert(res);
            })
            this.authService.logout();
            return;
          } else {
            console.log("onSubmit else in");
            this.userService.setCurrentUser(user);
            this.isLoading = false;
            this.form.reset();
            this.storage.getStorage(environment.memory_link)
              .then((url) => {
                if (url) {
                  this.router.navigateByUrl(url, { replaceUrl: true });
                  this.storage.removeStorage(environment.memory_link);
                  // setTimeout(() => window.location.reload(), 1000);
                } else {
                  this.router.navigateByUrl('/tabs', { replaceUrl: true });
                  // setTimeout(() => window.location.reload(), 1000);
                }
              })
          }
        } else {
            console.log("onSubmit else out");
          this.isLoading = false;
          this.translate.get("auth.errorCredential").subscribe((res: string) => {
            this.showAlert(res);
          })
          this.authService.logout();
        }
      })
      .catch(e => {
        this.isLoading = false;
        this.translate.get("auth.errorCredential").subscribe((res: string) => {
          let msg = res;
          this.showAlert(msg);
        console.error("onSubmit catch: ", msg);
        });
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
      this.toastService.presentToast('error', 'Error', msg, 10000);

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
  navigateTo(location: string) {
    this.router.navigate([location], { replaceUrl: true });
  }
}
