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
import { FieldValidationService } from 'src/app/services/field-validation/field-validation.service';

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
  flagCountry: string = '../../../../assets/img/resources/flag.png';
  contryCode: string = '--';
  planId: string;
  selectedCounry: any;
  waittingSubscription: boolean = false;
  subscriberCandidates: any[] = [];
  selectedExistingUser: any = null;
  searchingSubscriber: boolean = false;
  private subscriberSearchTimer: any;

  constructor(
    private location: LocationService,
    private authService: AuthService,
    private storage: StorageService,
    private userService: UserService,
    private toastService: ToastService,
    private language: LanguageService,
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private fieldValidationService: FieldValidationService,
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
    if (!country) {
      this.flagCountry = '../../../../assets/img/resources/flag.png';
      this.contryCode = '--';
      return;
    }
    this.flagCountry =
      country.flagUrl || '../../../../assets/img/resources/flag.png';
    this.contryCode = '+' + country.code || '--';
  }

  onSelect(event) {
    const value = (event.target as HTMLSelectElement).value;
    this.cities = this.allCities.filter((e) => e.countryId === value);
    this.selectedCounry = this.countries.filter((e) => e._id === value);
    this.selectedCounry = this.selectedCounry[0];
    this.setFlag(value);
    this.form?.get('phone')?.updateValueAndValidity();
    this.form?.get('whatsapp')?.updateValueAndValidity();
  }

  createSubscriptionItem() {
    const payload = {
      ...this.form.value,
      ...(this.selectedExistingUser && { userId: this.selectedExistingUser._id }),
      subscriptionStartDate: this.formatDateToISO(
        this.form.value.subscriptionStartDate,
      ),
    };
    this.waittingSubscription = true;
    this.subscriptionService.addSubscriber(payload)
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
            this.closeModal('add_subscriber_modal');
            this.form.reset();
            this.clearSelectedExistingUser(false);
            this.initForm()
            this.waittingSubscription = false;
            this.refresh();
          } else {
            this.toastService.presentToast(
              'error',
              'Error',
              'This email or whatsapp already exist',
              10000,
            );
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
    })
  }

  refresh(): void {
    window.location.reload();
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
      phone: new FormControl(null, {
        validators: [
          Validators.required,
          this.fieldValidationService.phoneValidator(() => String(this.selectedCounry?.code || '237')),
        ],
      }),
      whatsapp: new FormControl(null, {
        validators: [
          this.fieldValidationService.phoneValidator(() => String(this.selectedCounry?.code || '237')),
        ],
      }),
      balance: new FormControl(0, { validators: [Validators.required] }),
      countryId: new FormControl(null, { validators: [Validators.required] }),
      cityId: new FormControl(null, { validators: [Validators.required] }),
      agreeTerms: new FormControl(true, { validators: [Validators.required] }),
      language: new FormControl(lang, { validators: [Validators.required] }),
      pictureUrl: new FormControl('assets/img/new/user.png', {
        validators: [Validators.required],
      }),
      email: new FormControl(null, {
        validators: [Validators.required, this.fieldValidationService.emailValidator()],
      }),
      password: new FormControl('00000000', {
        validators: [Validators.required, Validators.minLength(8)],
      }),
      userId: new FormControl(null),
      subscriptionStartDate: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
      planId: new FormControl(this.planId, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });

    this.form.get('email')?.valueChanges.subscribe(() => this.queueSubscriberSearch());
    this.form.get('phone')?.valueChanges.subscribe(() => this.queueSubscriberSearch());
  }

  onSubmit() {
    if (this.selectedExistingUser) {
      if (!this.form.value.subscriptionStartDate) {
        this.form.get('subscriptionStartDate')?.markAsTouched();
        this.toastService.presentToast(
          'warning',
          'Invalid form',
          'Please verify your form.',
          10000,
        );
        return;
      }
      this.createSubscriptionItem();
      return;
    }

    const phoneDigits = this.fieldValidationService.normalizePhoneDigits(this.form.value.phone);
    this.form.value.phone = phoneDigits;

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

    if (!this.isValidPhoneNumber(this.form.value.phone, this.selectedCounry?.code || '237')) {
      this.toastService.presentToast(
        'warning',
        'Invalid phone number',
        'Please enter a valid phone number.',
        10000,
      );
      return;
    }
    this.form.value.whatsapp = this.contryCode + ' ' + phoneDigits;
    this.createSubscriptionItem();
  }

  queueSubscriberSearch(): void {
    if (this.selectedExistingUser || !this.form) return;
    clearTimeout(this.subscriberSearchTimer);
    this.subscriberSearchTimer = setTimeout(() => this.searchExistingSubscriber(), 400);
  }

  searchExistingSubscriber(): void {
    const email = String(this.form.get('email')?.value || '').trim();
    const phone = this.fieldValidationService.normalizePhoneDigits(this.form.get('phone')?.value || '');
    const countryCode = String(this.selectedCounry?.code || '237');
    const validEmail = this.fieldValidationService.isValidEmail(email);
    const validPhone = this.fieldValidationService.isValidPhoneForCountry(phone, countryCode);
    const keyword = validEmail ? email : validPhone ? `${this.contryCode} ${phone}` : '';

    if (!keyword) {
      this.subscriberCandidates = [];
      return;
    }

    this.searchingSubscriber = true;
    this.subscriptionService.searchSubscriberCandidates(keyword).subscribe({
      next: (users) => {
        this.subscriberCandidates = users || [];
        this.searchingSubscriber = false;
      },
      error: () => {
        this.subscriberCandidates = [];
        this.searchingSubscriber = false;
      },
    });
  }

  selectExistingUser(user: any): void {
    this.selectedExistingUser = user;
    this.subscriberCandidates = [];
    const countryId = user?.countryId?._id || user?.countryId || null;
    const cityId = user?.cityId?._id || user?.cityId || null;
    if (countryId && this.countries?.length) {
      this.selectedCounry = this.countries.find((country) => country._id === countryId) || user.countryId;
      this.cities = this.allCities.filter((city) => city.countryId === countryId);
      this.setFlag(countryId);
    }
    this.form.patchValue({
      userId: user?._id || null,
      firstName: user?.firstName || null,
      lastName: user?.lastName || null,
      name: user?.name || null,
      email: user?.email || null,
      phone: user?.phone || this.fieldValidationService.normalizePhoneDigits(user?.whatsapp || ''),
      whatsapp: user?.whatsapp || null,
      countryId,
      cityId,
    }, { emitEvent: false });
  }

  clearSelectedExistingUser(resetSearch = true): void {
    this.selectedExistingUser = null;
    this.form?.patchValue({ userId: null }, { emitEvent: false });
    if (resetSearch) this.queueSubscriberSearch();
  }

  showUserName(user: any): string {
    if (!user) return '';
    return user.accountType === 'personal'
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
      : user.name || user.email || user.whatsapp;
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
    return this.fieldValidationService.isValidPhoneForCountry(input, countryCode);
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
