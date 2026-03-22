import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { routes } from 'src/app/core/helpers/routes/routes';
import { LocationService } from 'src/app/services/location/location.service';
import { PaymentMethodsService } from 'src/app/services/payment-methods/payment-methods.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-payment-settings',
  templateUrl: './payment-settings.component.html',
  styleUrls: ['./payment-settings.component.scss']
})
export class PaymentSettingsComponent implements OnInit {
  public routes = routes;
  public paymentmode = 'payment1';
  public paymentMethodsList: any;
  public selectedPaymentMethod: any;
  public editPaymentMethodForm: FormGroup;
  public createPaymentMethodForm: FormGroup;
  public statusUpdating: Record<string, boolean> = {};
  public saveLoading = false;
  public createLoading = false;
  flagCountry: string = '../../../../assets/resources/flag.png';
  createFlagCountry: string = '../../../../assets/resources/flag.png';
  countries: any = [];
  gettingLocations: boolean = true;

  constructor(
    private paymentMethodsService: PaymentMethodsService,
    private toastService: ToastService,
    private translate: TranslateService,
    private location: LocationService,
  ) {
    this.editPaymentMethodForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
      countryId: new FormControl('', [Validators.required]),
      provider: new FormControl('', [Validators.required]),
      taxesPayment: new FormControl(0, [Validators.required, Validators.min(0)]),
      taxesTransfer: new FormControl(0, [Validators.required, Validators.min(0)]),
      minAmount: new FormControl(0, [Validators.required, Validators.min(0)]),
      maxAmount: new FormControl(0, [Validators.required, Validators.min(0)]),
      statusPayin: new FormControl(false),
      statusPayout: new FormControl(false),
    });
    this.createPaymentMethodForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
      countryId: new FormControl('', [Validators.required]),
      provider: new FormControl('', [Validators.required]),
      taxesPayment: new FormControl(0, [Validators.required, Validators.min(0)]),
      taxesTransfer: new FormControl(0, [Validators.required, Validators.min(0)]),
      minAmount: new FormControl(0, [Validators.required, Validators.min(0)]),
      maxAmount: new FormControl(0, [Validators.required, Validators.min(0)]),
      statusPayin: new FormControl(false),
      statusPayout: new FormControl(false),
    });
    this.getLocations();
  }

  onSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.setCountry(value);
  }

  onSelectCreate(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.setCountryCreate(value);
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
        this.gettingLocations = false;
      });
    });
  }

  setCountry(countryId: string) {
    if (!countryId) {
      this.editPaymentMethodForm.patchValue({ countryId: '' });
      this.flagCountry = '../../../../assets/resources/flag.png';
      return;
    }
    let country = this.countries.filter((e) => e._id === countryId);
    country = country[0];
    if (!country) {
      return;
    }
    this.editPaymentMethodForm.patchValue({
      countryId: country._id,
    });
    this.setFlag(country._id);
  }

  setCountryCreate(countryId: string) {
    if (!countryId) {
      this.createPaymentMethodForm.patchValue({ countryId: '' });
      this.createFlagCountry = '../../../../assets/resources/flag.png';
      return;
    }
    let country = this.countries.filter((e) => e._id === countryId);
    country = country[0];
    if (!country) {
      return;
    }
    this.createPaymentMethodForm.patchValue({
      countryId: country._id,
    });
    this.setFlagCreate(country._id);
  }

  setFlag(coutryId: string) {
    let country = this.countries.filter((e) => e._id === coutryId);
    country = country[0];
    if (!country) {
      this.flagCountry = '../../../../assets/resources/flag.png';
      return;
    }
    this.flagCountry =
      country.flagUrl || '../../../../assets/resources/flag.png';
  }

  setFlagCreate(coutryId: string) {
    let country = this.countries.filter((e) => e._id === coutryId);
    country = country[0];
    if (!country) {
      this.createFlagCountry = '../../../../assets/resources/flag.png';
      return;
    }
    this.createFlagCountry =
      country.flagUrl || '../../../../assets/resources/flag.png';
  }

  ngOnInit(): void {
    this.getPaymentMethodsList();
  }

  getPaymentMethodsList() {
    this.paymentMethodsService.getAllPaymentMethods().subscribe((resp: any) => {
      this.paymentMethodsList = resp;
    });
  }

  isStatusUpdating(methodId: string, field: 'statusPayin' | 'statusPayout'): boolean {
    return !!this.statusUpdating[this.getStatusKey(methodId, field)];
  }

  toggleMethodStatus(
    method: any,
    field: 'statusPayin' | 'statusPayout',
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement;
    const nextValue = !!target.checked;
    const previousValue = !!method?.[field];

    if (!method?._id) {
      target.checked = previousValue;
      return;
    }

    const key = this.getStatusKey(method._id, field);
    this.statusUpdating[key] = true;
    method[field] = nextValue;

    this.paymentMethodsService.updatePaymentMethods(method._id, { [field]: nextValue }).subscribe((resp: any) => {
      this.statusUpdating[key] = false;
      if (resp?.error) {
        method[field] = previousValue;
        target.checked = previousValue;
        this.showError('payment.paymentSettings.toggleError');
        return;
      }

      const updatedValue =
        typeof resp?.[field] === 'boolean' ? resp[field] : nextValue;
      method[field] = updatedValue;
      target.checked = updatedValue;
      this.showSuccess('payment.paymentSettings.toggleSuccess');
    });
  }

  openEditModal(method: any, countryId?: string): void {
    this.selectedPaymentMethod = method;
    const selectedCountryId = countryId || method?.countryId?._id || method?.countryId || '';
    this.editPaymentMethodForm.reset({
      name: method?.name || '',
      image: method?.image || '',
      countryId: selectedCountryId,
      provider: method?.provider || '',
      taxesPayment: method?.taxesPayment ?? 0,
      taxesTransfer: method?.taxesTransfer ?? 0,
      minAmount: method?.minAmount ?? 0,
      maxAmount: method?.maxAmount ?? 0,
      statusPayin: !!method?.statusPayin,
      statusPayout: !!method?.statusPayout,
    });
    this.setCountry(selectedCountryId);
  }

  openCreateModal(): void {
    this.createPaymentMethodForm.reset({
      name: '',
      image: '',
      countryId: '',
      provider: '',
      taxesPayment: 0,
      taxesTransfer: 0,
      minAmount: 0,
      maxAmount: 0,
      statusPayin: false,
      statusPayout: false,
    });
    this.createFlagCountry = '../../../../assets/resources/flag.png';
  }

  createPaymentMethod(): void {
    if (this.createPaymentMethodForm.invalid) {
      this.createPaymentMethodForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.createPaymentMethodForm.value,
      taxesPayment: Number(this.createPaymentMethodForm.value.taxesPayment),
      taxesTransfer: Number(this.createPaymentMethodForm.value.taxesTransfer),
      minAmount: Number(this.createPaymentMethodForm.value.minAmount),
      maxAmount: Number(this.createPaymentMethodForm.value.maxAmount),
    };

    this.createLoading = true;
    this.paymentMethodsService.createPaymentMethods(payload as any).subscribe((resp: any) => {
      this.createLoading = false;

      if (resp?.error) {
        this.showError('payment.paymentSettings.createError');
        return;
      }

      if (!Array.isArray(this.paymentMethodsList)) {
        this.paymentMethodsList = [];
      }
      this.paymentMethodsList = [resp, ...this.paymentMethodsList];
      this.showSuccess('payment.paymentSettings.createSuccess');
      this.closeCreateModal();
    });
  }

  savePaymentMethod(): void {
    if (!this.selectedPaymentMethod?._id) {
      return;
    }

    if (this.editPaymentMethodForm.invalid) {
      this.editPaymentMethodForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.editPaymentMethodForm.value,
      taxesPayment: Number(this.editPaymentMethodForm.value.taxesPayment),
      taxesTransfer: Number(this.editPaymentMethodForm.value.taxesTransfer),
      minAmount: Number(this.editPaymentMethodForm.value.minAmount),
      maxAmount: Number(this.editPaymentMethodForm.value.maxAmount),
    };

    this.saveLoading = true;
    this.paymentMethodsService
      .updatePaymentMethods(this.selectedPaymentMethod._id, payload)
      .subscribe((resp: any) => {
        this.saveLoading = false;

        if (resp?.error) {
          this.showError('payment.paymentSettings.saveError');
          return;
        }

        const index = this.paymentMethodsList?.findIndex(
          (item: any) => item?._id === this.selectedPaymentMethod?._id,
        );

        if (index > -1) {
          this.paymentMethodsList[index] = {
            ...this.paymentMethodsList[index],
            ...resp,
          };
        }

        this.showSuccess('payment.paymentSettings.saveSuccess');
        this.closeEditModal();
      });
  }

  private closeEditModal(): void {
    const closeBtn = document.getElementById('closeEditPaymentMethodModal');
    if (closeBtn) {
      closeBtn.click();
    }
  }

  private closeCreateModal(): void {
    const closeBtn = document.getElementById('closeCreatePaymentMethodModal');
    if (closeBtn) {
      closeBtn.click();
    }
  }

  private getStatusKey(methodId: string, field: 'statusPayin' | 'statusPayout'): string {
    return `${methodId}_${field}`;
  }

  private showSuccess(messageKey: string): void {
    this.toastService.presentToast(
      'success',
      this.translate.instant('payment.success'),
      this.translate.instant(messageKey),
      4000,
    );
  }

  private showError(messageKey: string): void {
    this.toastService.presentToast(
      'error',
      this.translate.instant('payment.error'),
      this.translate.instant(messageKey),
      6000,
    );
  }
}
