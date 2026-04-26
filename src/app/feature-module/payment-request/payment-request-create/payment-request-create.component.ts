import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { FieldValidationService } from 'src/app/services/field-validation/field-validation.service';
import { PaymentRequestService } from 'src/app/services/payment-request/payment-request.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { PrintService } from 'src/app/services/print/print.service';
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
  processing = false;
  transactionData: any;

  currency = 'XAF';
  countryCode = '237';
  providerOptions: ProviderOption[] = [];

  requestSubmitted = false;
  polling = false;
  pollStatus = '';
  pollTimer: any;
  pollAttempts = 0;
  createdTxRef = '';
  redirect_url = '';

  submittedAmount = 0;
  submittedCurrency = 'XAF';
  submittedPhone = '';

  loadingData: boolean = true;
  systemData: any;
  invoiceTaxes: number = 5;
  printing: boolean = false;

  constructor(
    private paymentRequestService: PaymentRequestService,
    private userService: UserService,
    private toastService: ToastService,
    public fieldValidationService: FieldValidationService,
    private router: Router,
    private location: Location,
    private paymentService: PaymentService,
    private systemService: SystemService,
    private pdfExportService: PrintService,
    private toastr: ToastrService,
  ) {
    this.form = new FormGroup({
      amount: new FormControl(0, [Validators.required]),
      provider: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      email: new FormControl('', [this.fieldValidationService.emailValidator()]),
      reason: new FormControl('Payment request.'),
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

    this.processing = true;
    this.paymentRequestService
      .createPaymentRequest(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.error) {
          this.processing = false;
          this.toastService.presentToast('error', 'Error', 'Operation failed');
          return;
        }
        this.copyToClipboard(this.form.value.phone);

        this.createdTxRef =
          res?.txRef ||
          res?.tx_ref ||
          res?.data?.txRef ||
          res?.data?.tx_ref ||
          '';
        this.redirect_url =
          res?.redirect_url ||
          res?.data?.redirect_url ||
          '';

        const transactionId = res?.transactionId || res?.data?.transactionId || '';

        this.requestSubmitted = true;
        this.polling = true;
        this.pollStatus = 'pending';
        this.submittedAmount = amount;
        this.submittedCurrency = this.currency;
        this.submittedPhone = payload.mobile_money.phone;
        this.form.disable();
        this.startPolling(transactionId);
        this.handleRequest(transactionId);
      });
  }

  
  copyToClipboard(text: string): void {
    
    navigator.clipboard.writeText(text)
      .then(() => {
        this.toastr.info('Le numéro de téléphone a été copié', 'Copié');
      })
      .catch((error) => {
        this.toastr.error('Erreur lors de la copie du numéro de téléphone', 'Erreur');
      });
  }

  startPolling(transactionId: string) {
    if (!transactionId) {
      this.polling = false;
      this.processing = false;
      return;
    }

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

  openModal() {
    return window.open(this.redirect_url, '_blank', 'width=800,height=800');
  }

  handleRequest(transactionId?: string): void {
    if (!this.redirect_url) {
      return;
    }

    const payWin = this.openModal();
    if (!payWin) {
      location.href = this.redirect_url;
      return;
    }

    const timer = setInterval(() => {
      if (payWin.closed) {
        clearInterval(timer);
        if (transactionId) {
          this.checkStatus(transactionId);
        }
      }
    }, 600);
  }

  checkStatus(transactionId: string) {
    this.processing = true;
    this.paymentService
      .getTransactionData(transactionId)
      .subscribe((res: any) => {
        if (!res) {
          this.processing = false;
          return;
        }

        const status = String(
          res?.status || res?.data?.status || res?.data?.data?.status || '',
        );
        this.transactionData = res;

        if (
          status === this.paymentService.status.PAYINPENDING ||
          status === this.paymentService.status.INITIALIZED
        ) {
          this.pollStatus = 'pending';
          this.processing = true;
          return;
        }

        if (status === this.paymentService.status.PAYINSUCCESS) {
          this.pollStatus = 'success';
          this.toastService.presentToast('success', 'Payment done !', '');
          this.processing = false;
          this.stopPolling();
          // this.goToList();
          this.scrollToTop();
          return;
        }

        if (status === this.paymentService.status.PAYINERROR) {
          this.pollStatus = 'failed';
          this.toastService.presentToast('error', 'Error on the request !', '');
          this.processing = false;
          this.stopPolling();
          this.scrollToTop();
          return;
        }

        if (status === this.paymentService.status.PAYINCLOSED) {
          this.pollStatus = 'canceled';
          this.processing = false;
          this.stopPolling();
          this.scrollToTop();
          return;
        } else {
          this.processing = true;
        }
      });
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }

  public exportToPdf(): void {
    // console.log('exportation de pdf');
    if (this.transactionData) {
      this.toastService.presentToast('info', 'Download', 'Téléchargement en cours...');
      // this.toastService.info("Téléchargement en cours...", "PDF", {
      //   timeOut: 10000,
      //   closeButton: true,
      // });
      this.printing = true;
      setTimeout(() => {
        this.pdfExportService.generatePdf('receipt', 'Recu_' + this.transactionData._id + '.pdf');
      }, 1 * 1000);
      setTimeout(() => {
        this.printing = false;
      }, 5 * 1000);
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
