// footer.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LocationService } from 'src/app/services/location/location.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from 'src/app/services/language/language.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';

@Component({
  selector: 'app-add-subscriber',
  templateUrl: './add-subscriber.component.html',
  styleUrls: ['./add-subscriber.component.scss'],
})
export class AddSubscriberComponent implements OnInit {
  form: FormGroup;
  formType: string = 'personal';
  isLoading: boolean;
  gettingLocations: boolean = true;
  countries: any = [];
  cities: any = [];
  allCities: any = [];
  flagCountry: string = '../../../../assets/resources/flag.png';
  contryCode: string = '--';
  planId: string;
  selectedCounry: any;
  waittingSubscription: boolean = false;

  constructor(
    private location: LocationService,
    private authService: AuthService,
    private storage: StorageService,
    private userService: UserService,
    private toastService: ToastService,
    private language: LanguageService,
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((datas: any) => {
      this.scrollToTop();
      this.getId();
      this.initForm();
      this.getLocations();
    });
  }

  getId() {
    this.planId = this.route.snapshot.paramMap.get('id');
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  setFlag(coutryId) {
    let country = this.countries.filter((e) => e._id === coutryId);
    country = country[0];
    this.flagCountry =
      country.flagUrl || '../../../../assets/resources/flag.png';
    this.contryCode = '+' + country.code || '--';
  }

  onSelect(event) {
    const value = (event.target as HTMLSelectElement).value;
    this.cities = this.allCities.filter((e) => e.countryId === value);
    this.selectedCounry = this.countries.filter((e) => e._id === value);
    this.selectedCounry = this.selectedCounry[0];
    this.setFlag(value);
  }

  createSubscriptionItem() {
    this.form.value.subscriptionStartDate = this.formatDateToISO(
      this.form.value.subscriptionStartDate,
    );
    console.log('Form initialized:', this.form.value);
    this.waittingSubscription = true;
    this.subscriptionService.addSubscriber(this.form.value)
    .subscribe({
      next: (response) => {
          const hasError =
            !!response?.error ||
            (!!response?.statusCode && Number(response.statusCode) >= 400) ||
            response?.statusCode === 404;

          if (!hasError) {
            this.toastService.presentToast(
              'success',
              'Subscriber added successfully',
              'The user has been created and added to the plan subscribers',
              10000,
            );
            console.log('data', response);
            this.closeModal('add_subscriber_modal');
            this.form.reset();
            this.initForm()
            this.waittingSubscription = false;
          } else {
            this.toastService.presentToast(
              'error',
              'Error',
              'This email or whatsapp already exist',
              10000,
            );
            console.error('Error no resp:', response);
            this.waittingSubscription = false;
            return this.closeModal('add_subscriber_modal');
          }
      },
      error: (err) => {
          this.toastService.presentToast(
            'error',
            'Error',
            'Error to subscribe user: ' + err.message || 'Unknown error',
            10000,
          );
          this.form.reset();
          this.initForm()
          this.waittingSubscription = false;
      },
      complete: () => {
        console.log('complete case');
      },
    })
  }

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
      whatsapp: new FormControl(null),
      balance: new FormControl(0, { validators: [Validators.required] }),
      countryId: new FormControl(null, { validators: [Validators.required] }),
      cityId: new FormControl(null, { validators: [Validators.required] }),
      agreeTerms: new FormControl(true, { validators: [Validators.required] }),
      language: new FormControl(lang, { validators: [Validators.required] }),
      pictureUrl: new FormControl('assets/img/new/user.png', {
        validators: [Validators.required],
      }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('00000000', {
        validators: [Validators.required, Validators.minLength(8)],
      }),
      subscriptionStartDate: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
      planId: new FormControl(this.planId, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });
  }

  onSubmit() {
    this.form.value.phone = this.form.value.phone.replace(/\D/g, '');

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.toastService.presentToast(
        'warning',
        'Invalid form',
        'Please verify your form.',
        10000,
      );
      return;
    }

    if (
      !this.isValidPhoneNumber(this.form.value.phone, this.selectedCounry.code)
    ) {
      this.toastService.presentToast(
        'warning',
        'Invalid phone number',
        'Please enter a valid phone number.',
        10000,
      );
      return;
    }
    this.form.value.whatsapp = this.contryCode + ' ' + this.form.value.phone.replace(/\D/g, '');
    this.createSubscriptionItem();
  }

  formatDateToISO(dateInput: string | Date): string {
    if (!dateInput) return '';

    let date: Date;

    // If it is already in rigth format
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      // Relace all possivle separators with line (-)
      const normalized = dateInput.replace(/[\/\.]/g, '-');

      // Verify if format is YYYY-MM-DD or DD-MM-YYYY
      const parts = normalized.split('-');

      if (parts[0].length === 4) {
        // Format : YYYY-MM-DD
        date = new Date(normalized);
      } else if (parts[2].length === 4) {
        // Format : DD-MM-YYYY → reverse
        const [day, month, year] = parts.map(Number);
        date = new Date(year, month - 1, day);
      } else {
        throw new Error('Format de date non reconnu : ' + dateInput);
      }
    }

    // Create an ISO string with UTC
    const isoString = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        50,
        792,
      ),
    ).toISOString();

    // Add +00:00
    return isoString.replace('Z', '+00:00');
  }

  getLocations() {
    this.location.getCountries()
    .subscribe((countries) => {
      if(countries.length > 0) {
        // console.log('countries: ', countries);
        this.countries = countries.sort((a, b) => a.name.localeCompare(b.name));
        this.countries = this.countries.filter((e) => e.status != false);
        this.location.getCities().subscribe((cities) => {
          // console.log('cities: ', cities);
          this.allCities = cities.sort((a, b) => a.name.localeCompare(b.name));
          this.gettingLocations = false;
        });}
    });
  }

  isValidPhoneNumber(input: string, countryCode): boolean {
    console.log('Input phone number:', input);
    // Chech if string has exactly 9 numbers
    if (countryCode === '237') {
      const isNineDigits = /^\d{9}$/.test(input);
      return isNineDigits;
    }
    return true;
  }


  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('style', 'display: none;');
    }

    document.body.classList.remove('modal-open');
    document.body.removeAttribute('style');
    document
      .querySelectorAll('.modal-backdrop')
      .forEach((backdrop) => backdrop.remove());
  }
}
