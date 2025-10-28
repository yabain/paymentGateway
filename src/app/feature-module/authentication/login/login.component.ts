import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { routes } from 'src/app/core/core.index';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { LocationService } from 'src/app/services/location/location.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public routes = routes;

  form: FormGroup;
  form2: FormGroup;
  type = true; // Used to toggle password visibility
  isLoading: boolean = false;
  isEmail: boolean = true;
  countries: any = [];
  selectedCountry: any;
  contryCode: string = '--';
  phone: number;
  gettingLocations: boolean = true;

  flagCountry: string = 'assets/ressorces/flag.png';

  constructor(
    private authService: AuthService,
    private router: Router,
    // private alertController: AlertController,
    private storage: StorageService,
    private userService: UserService,
    private translate: TranslateService,
    private systemService: SystemService,
    private toastService: ToastService,
    private language: LanguageService,
    private location: LocationService,
  ) {
    this.initForm();
    this.getLocations();
  }

  /**
   * Initializes the component and checks if the user is already connected
   */
  ngOnInit() {
    this.getIfIsConnected().then((response) => {
      if (response === true) {
        this.router.navigateByUrl('/tabs', { replaceUrl: true });
      }
    });
  }

  /**
   * Retrieves and sets available countries and cities for the form.
   */
  getLocations() {
    this.location.getCountries().subscribe((countries) => {
      this.countries = countries.sort((a, b) => a.name.localeCompare(b.name));
      this.countries = this.countries.filter((e) => e.status != false);
      this.gettingLocations = false;
    });
  }

  onSelect(event) {
    const value = (event.target as HTMLSelectElement).value;
    let country = this.countries.filter((e) => e._id === value);
    this.selectedCountry = country[0];
    this.setFlag(value);
  }

  setFlag(coutryId) {
    let country = this.countries.filter((e) => e._id === coutryId);
    country = country[0];
    this.flagCountry =
      country.flagUrl || '../../../../assets/ressorces/flag.png';
    this.contryCode = '+' + country.code || '--';
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
      type: new FormControl('email', {
        validators: [Validators.required],
      }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });

    this.form2 = new FormGroup({
      type: new FormControl('phone', {
        validators: [Validators.required],
      }),
      whatsapp: new FormControl(null, {
        validators: [Validators.required],
      }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
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
    if (this.isEmail) {
      if (!this.form.valid) {
        this.form.markAllAsTouched();
        return;
      }
    } else {
      const phone = this.form2.value.whatsapp;
      this.form2.value.whatsapp = this.selectedCountry.code + ' ' + phone.toString();
      if (!this.form2.valid) {
        this.form.markAllAsTouched();
        return;
      }
    }

    this.isLoading = true;
    this.authService
      .login(this.isEmail ? this.form.value : this.form2.value)
      .then((user: any) => {
        if (user) {
          if (user === false) {
            this.translate
              .get('auth.errorCredential')
              .subscribe((res: string) => {
                this.isLoading = false;
                this.showAlert(res);
                return;
              });
          }
          if (user.isActive === false) {
            this.isLoading = false;
            this.translate
              .get('auth.desabledAccountMsg')
              .subscribe((res: string) => {
                this.showAlert(res);
              });
            // this.authService.logout();
            return;
          } else {
            this.userService.setCurrentUser(user);
            this.isLoading = false;
            this.language.setLocalUserLanguage(user.language);
            this.language.useLanguage(user.language);
            this.form.reset();
            this.storage.getStorage(environment.memory_link).then((url) => {
              if (url) {
                this.router.navigateByUrl(url, { replaceUrl: true });
                this.storage.removeStorage(environment.memory_link);
                // setTimeout(() => window.location.reload(), 1000);
              } else {
                this.router.navigateByUrl('/tabs', { replaceUrl: true });
                // setTimeout(() => window.location.reload(), 1000);
              }
            });
          }
        } else {
          this.isLoading = false;
          this.translate
            .get('auth.errorCredential')
            .subscribe((res: string) => {
              this.showAlert(res);
            });
          // this.authService.logout();
        }
      })
      .catch((e) => {
        this.isLoading = false;
        const err = e.error.message.message;
        console.error('error to login: ', e.error.message.message)
        if (err.search('account is disabled') > 0) {
          this.translate
            .get('auth.desabledAccountMsg')
            .subscribe((res: string) => {
              this.toastService.presentToast('error', 'Error', res, 10000);
            });
          // this.authService.logout();
        } else {
          console.error('onSubmit catch: ', e.error.message.message);
          this.translate
            .get('auth.errorCredential')
            .subscribe((res: string) => {
              this.showAlert(res);
            });
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
    let msg = '';
    this.translate.get('auth.authenticationFailed').subscribe((res: string) => {
      msg = res;
      this.toastService.presentToast('error', 'Error', msg, 10000);
    });
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

  toggleChoice(isEmail: boolean) {
    this.isEmail = isEmail;
  }
}
