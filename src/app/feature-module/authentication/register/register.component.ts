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
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  /**
   * Reactive form for user sign-up details.
   */
  form: FormGroup;

  /**
   * Boolean to control password visibility toggle.
   */
  type = true;

  /**
   * registration form visibility toggle.
   */
  formType: string = 'personal';

  /**
   * Loading indicator for form submission and locations fetching.
   */
  isLoading: boolean;
  gettingLocations: boolean = true;

  /**
   * Arrays to hold countries, cities, and all cities for filtering.
   */
  countries: any = [];
  cities: any = [];
  allCities: any = [];

  flagCountry: string = '../../../../assets/ressorces/flag.png';
  contryCode: string = '--';

  public routes = routes;

  public show_password = true;
  public showConfirmPassword: boolean = false;

  constructor(
    private location: LocationService,
    private authService: AuthService,
    private router: Router,
    private systemService: SystemService,
    private storage: StorageService,
    private translate: TranslateService,
    private language: LanguageService,
    private userService: UserService,
    private toastService: ToastService,
  ) {}

  /**
   * Initializes component and triggers location data retrieval.
   */
  async ngOnInit() {
    await this.initForm();
    this.getLocations();
    this.updateFormStructure('personal');
  }
  /**
   * Initializes the reactive form with necessary fields and validators.
   */
  async initForm(): Promise<void> {
    let lang = (await this.language.getDefaultLanguage()) || 'en';
    this.form = new FormGroup({
      firstName: new FormControl(null),
      lastName: new FormControl(null),
      name: new FormControl(null),
      accountType: new FormControl('personal', {
        validators: [Validators.required],
      }),
      phone: new FormControl(null, { validators: [Validators.required] }),
      countryId: new FormControl(null, { validators: [Validators.required] }),
      cityId: new FormControl(null, { validators: [Validators.required] }),
      agreeTerms: new FormControl(null, { validators: [Validators.required] }),
      language: new FormControl(lang, { validators: [Validators.required] }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });
    console.log('Form initialized:', this.form.value);
  }

  /**
   * Toggles the password visibility.
   */
  changeType() {
    this.type = !this.type;
  }

  /**
   * Retrieves and sets available countries and cities for the form.
   */
  getLocations() {
    this.location.getCountries().subscribe((countries) => {
      // console.log('countries: ', countries);
      this.countries = countries.sort((a, b) => a.name.localeCompare(b.name));
      this.countries = this.countries.filter((e) => e.status != false);
      this.location.getCities().subscribe((cities) => {
        // console.log('cities: ', cities);
        this.allCities = cities.sort((a, b) => a.name.localeCompare(b.name));
        this.gettingLocations = false;
      });
    });
  }

  togglePasswordVisibility() {
    this.show_password = !this.show_password;
  }

  navigation() {
    this.router.navigate([routes.sassLogin]);
  }

  /**
   * Handles the form submission process, registers the user and navigates to home if successful.
   */
  onSubmit(): void {
    console.log('form', this.form.value);

    // Vérification numéro
    if (!this.isValidPhoneNumber(this.form.value.phone)) {
      this.toastService.presentToast(
        'warning',
        'Invalid phone number',
        'Please enter a valid phone number.',
        10000,
      );
      return;
    }

    // Vérification formulaire
    if (this.form.value.accountType === 'persolnal') {
      this.form.get('firstName').setValidators([Validators.required]);
      this.form.get('lastName').setValidators([Validators.required]);
      this.form.get('name').clearValidators();
      this.form.value.name = null;
      console.log('Account personal', this.form);
    } else if (this.form.value.accountType === 'organisation') {
      this.form.get('name').setValidators([Validators.required]);
      this.form.get('firstName').clearValidators();
      this.form.get('lastName').clearValidators();
      this.form.value.firstName = null;
      this.form.value.lastName = null;
      console.log('Account organisation', this.form);
    }

    // if (!this.form.valid) {
    //   this.form.markAllAsTouched();
    //   this.showAlert('Error form');
    //   return;
    // }

    // Nettoyage numéro
    this.form.value.phone = this.form.value.phone.replace(/\D/g, '');

    this.isLoading = true;

    // return ;
    this.authService.register(this.form.value).subscribe({
      next: (data) => {
        if (data) {
          this.userService.setCurrentUser(data);
          this.storage.getStorage(environment.memory_link).then((url) => {
            if (url) {
              this.router.navigateByUrl(url, { replaceUrl: true });
              this.storage.removeStorage(environment.memory_link);
              this.toastService.presentToast(
                'success',
                'Welcome !' +
                  this.userService.showName(this.form.value),
                'Your account has been created successfully !',
                10000,
              );
              // this.form.reset();
              // setTimeout(() => window.location.reload(), 1000);
            } else {
              this.router.navigateByUrl('/tabs', { replaceUrl: true });
              // this.form.reset();
              // setTimeout(() => window.location.reload(), 1000);
            }
          });
        }
        this.isLoading = false;
      },
      error: (e) => {
        this.isLoading = false;
        this.translate.get('auth.emailAlreadyUsed').subscribe((res: string) => {
          this.translate
            .get('auth.creationAccountError')
            .subscribe((res1: string) => {
              const msg = e.message.includes('email') ? res : res1;
              this.toastService.presentToast('error', 'Error', msg, 10000);
            });
        });
      },
    });
  }

  /**
   * Filters cities based on selected country.
   * @param country The selected country object.
   */
  onSelect(event) {
    const value = (event.target as HTMLSelectElement).value;
    this.cities = this.allCities.filter((e) => e.countryId === value);
    this.setFlag(value);
  }

  /**
   * Update registration form based on accountType.
   * @param accountType The selected country object.
   */
  accountTypeOnSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.updateFormStructure(value);
  }

  setFlag(coutryId) {
    let country = this.countries.filter((e) => e._id === coutryId);
    country = country[0];
    this.flagCountry =
      country.flagUrl || '../../../../assets/ressorces/flag.png';
    this.contryCode = '+' + country.code || '--';
  }

  updateFormStructure(accountType) {
    if (accountType == 'personal') {
      // this.form.reset();
      this.formType = 'personal';
      this.form.value.accountType = accountType;
      this.form.get('firstName').setValidators([Validators.required]);
      this.form.get('lastName').setValidators([Validators.required]);
      this.form.get('name').clearValidators();
      console.log('Account personal', this.form);
    } else if (accountType == 'organisation') {
      // this.form.reset();
      this.formType = 'organisation';
      this.form.value.accountType = accountType;
      this.form.get('name').setValidators([Validators.required]);
      this.form.get('firstName').clearValidators();
      this.form.get('lastName').clearValidators();
      console.log('Account personal', this.form);
    }
  }

  /**
   * Navigates to the home page.
   */
  navigateToHome() {
    this.router.navigate(['/tabs']);
  }

  /**
   * Navigates to the terms and conditions page.
   */
  navigateToTerms() {
    this.router.navigate(['/terms']);
  }

  isValidPhoneNumber(input: string): boolean {
    console.log('Input phone number:', input);
    // Chech if string has exactly 9 numbers
    const isNineDigits = /^\d{9}$/.test(input);
    return isNineDigits;
  }
}
