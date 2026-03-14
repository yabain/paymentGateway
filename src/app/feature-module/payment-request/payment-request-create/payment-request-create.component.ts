import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FieldValidationService } from 'src/app/services/field-validation/field-validation.service';
import { PaymentRequestService } from 'src/app/services/payment-request/payment-request.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

interface ProviderOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-payment-request-create',
  templateUrl: './payment-request-create.component.html',
  styleUrls: ['./payment-request-create.component.scss'],
})
export class PaymentRequestCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form: FormGroup;
  currentUser: any;
  loadingUser = true;
  submitting = false;

  currency = 'XAF';
  countryCode = '237';
  providerOptions: ProviderOption[] = [];

  requestSubmitted = false;
  polling = false;
  pollStatus = '';
  pollTimer: any;
  pollAttempts = 0;
  createdTxRef = '';

  submittedAmount = 0;
  submittedCurrency = 'XAF';
  submittedPhone = '';

  loadingData: boolean = true;
  processing: boolean = false;
  systemData: any;
  invoiceTaxes: number = 5;

  constructor(
    private paymentRequestService: PaymentRequestService,
    private userService: UserService,
    private toastService: ToastService,
    public fieldValidationService: FieldValidationService,
    private router: Router,
    private location: Location,
    private paymentService: PaymentService,
    private systemService: SystemService,
  ) {
    this.form = new FormGroup({
      amount: new FormControl(0, [Validators.required]),
      provider: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      email: new FormControl('', [this.fieldValidationService.emailValidator()]),
      reason: new FormControl(''),
    });
  }

  ngOnInit(): void {
    if (this.location.path().includes('admin-payment-request')) {
      this.router.navigate(['/admin-payment-request']);
      return;
    }

    this.getSytemData();
  }

  getSytemData() {
    this.systemService.getSystemData()
      .subscribe((resp: any) => {
        if (!resp.invoiceTaxes) return;;
        this.loadCurrentUser();
        this.form
          .get('provider')
          ?.valueChanges.pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.updatePhoneValidator();
          });
        this.systemData = resp;
        this.invoiceTaxes = resp ? resp.invoiceTaxes : 0;
      });
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

  async loadCurrentUser(): Promise<void> {
    this.currentUser = await this.userService.getCurrentUser();
    this.currency = this.fieldValidationService.normalizeCurrency(
      this.currentUser?.countryId?.currency || 'XAF',
    );
    this.countryCode = String(this.currentUser?.countryId?.code || '237');

    this.providerOptions = this.getProviderOptionsByCurrency(this.currency);
    this.form.patchValue({
      provider: this.providerOptions[0]?.value || '',
    });
    this.applyValidators();
    this.loadingUser = false;
  }

  getProviderOptionsByCurrency(currency: string): ProviderOption[] {
    if (currency === 'KES') {
      return [
        { value: 'MPESA', label: 'M-Pesa' },
        { value: 'AIRTEL_MONEY', label: 'AirtelMoney' },
      ];
    }
    return [
      { value: 'MOMO', label: 'MOMO' },
      { value: 'OM', label: 'OM' },
    ];
  }

  applyValidators(): void {
    this.form
      .get('amount')
      ?.setValidators([
        Validators.required,
        this.fieldValidationService.currencyAmountValidator(() => this.currency),
      ]);
    this.form.get('amount')?.updateValueAndValidity();
    this.updatePhoneValidator();
  }

  updatePhoneValidator(): void {
    this.form
      .get('phone')
      ?.setValidators([
        Validators.required,
        this.fieldValidationService.operatorPhoneValidator(
          () => this.countryCode,
          () => String(this.form.get('provider')?.value || ''),
        ),
      ]);
    this.form.get('phone')?.updateValueAndValidity();
  }

  mapProviderToBackend(value: string): string {
    const provider = String(value || '').toUpperCase();
    if (provider === 'MPESA') return 'm-pesa';
    if (provider === 'AIRTEL_MONEY') return 'atl';
    if (provider === 'MOMO') return 'momo';
    if (provider === 'OM') return 'om';
    return provider.toLowerCase();
  }

  formatPhoneForPayload(): string {
    const digits = this.fieldValidationService.normalizePhoneDigits(this.form.value.phone);
    return `+${this.countryCode} ${digits}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const amount = this.fieldValidationService.parseAmount(this.form.value.amount);
    if (!this.fieldValidationService.isValidAmount(amount, this.currency)) {
      this.toastService.presentToast(
        'error',
        'Error',
        this.fieldValidationService.getRangeMessage(this.currency),
      );
      return;
    }

    const phoneDigits = this.fieldValidationService.normalizePhoneDigits(this.form.value.phone);
    const provider = String(this.form.value.provider || '');
    if (!this.fieldValidationService.isValidOperatorPhone(phoneDigits, this.countryCode, provider)) {
      this.toastService.presentToast('warning', 'Warning', 'Invalid phone number');
      return;
    }

    const payload = {
      amount,
      email: String(this.form.value.email || '').trim() || 'no-email@digikuntz.com',
      reason: String(this.form.value.reason || '').trim(),
      mobile_money: {
        phone: this.formatPhoneForPayload(),
        provider: this.mapProviderToBackend(provider),
      },
    };

    this.submitting = true;
    this.paymentRequestService
      .createPaymentRequest(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.submitting = false;
        if (res?.error) {
          this.toastService.presentToast('error', 'Error', 'Operation failed');
          return;
        }

        this.createdTxRef =
          res?.txRef ||
          res?.tx_ref ||
          res?.data?.txRef ||
          res?.data?.tx_ref ||
          '';

        this.requestSubmitted = true;
        this.polling = true;
        this.pollStatus = 'pending';
        this.submittedAmount = amount;
        this.submittedCurrency = this.currency;
        this.submittedPhone = payload.mobile_money.phone;
        this.form.disable();
        this.startPolling(res?.transactionId);
      });
  }

  startPolling(transactionId: string) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      try {
        this.checkStatus(transactionId);
      } catch (err) {
        console.warn('polling error to get status', err);
      }
    }, 7000);
  }

  stopPolling(): void {
    this.polling = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  goToList(): void {
    this.router.navigate(['/payment-request']);
  }


  checkStatus(transactionId) {
    console.log('checkStatus: ', transactionId)
    this.processing = true;
    this.paymentService
      .getTransactionData(transactionId)
      .subscribe((res: any) => {
        if (res.status === this.paymentService.status.PAYOUTPENDING) {
          console.log('pending');
        } else if (res.status === this.paymentService.status.PAYOUTSUCCESS) {
          this.toastService.presentToast('success', 'Done !', '');
            this.processing = false;
            this.scrollToTop();
        } else if (res.status === this.paymentService.status.PAYOUTERROR) {
          this.toastService.presentToast('error', 'Error to Payout !', '');
            this.processing = false;
            this.scrollToTop();
        } else {
          this.processing = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
