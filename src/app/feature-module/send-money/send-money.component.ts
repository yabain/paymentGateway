import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ExchangeService } from 'src/app/services/exchange/exchange.service';
import { LocationService } from 'src/app/services/location/location.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { UserService } from 'src/app/services/user/user.service';
import { SystemService } from 'src/app/services/system/system.service';
import { DatePipe } from '@angular/common';
import { ToastService } from 'src/app/services/toast/toast.service';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FlutterwaveService } from 'src/app/services/flutterwave/flutterwave.service';
import { FieldValidationService } from 'src/app/services/field-validation/field-validation.service';
import { PaymentMethodsService } from 'src/app/services/payment-methods/payment-methods.service';
declare var FlutterwaveCheckout: any;

@Component({
  selector: 'app-send-money',
  templateUrl: './send-money.component.html',
  styleUrls: ['./send-money.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SendMoneyComponent implements OnInit {
  selectedMethod: any;
  step: number = 1;
  invoiceTaxes: number = 5;
  currentUser: any | undefined;
  waitingUserData: boolean = true;
  categoryId: string;
  taxesAmount: number = 0;
  transactionRef: any;
  currentDate: any;
  loadingData: boolean = true;
  proceed: boolean = false;
  transactionData!: any;
  showDescription: boolean = false;
  newPayment: number = 0;
  waitingExchangeRate: boolean = true;
  private destroy$ = new Subject<void>();
  availableCountries: any[] = [];
  waitingLocations: boolean = true;
  flagCountry: string = 'assets/img/resources/flag.png';
  selectedCountry: any;
  idParam: string | null = null;
  receiverName!: string;
  receiverFirstName: string = '';
  receiverLastName: string = '';
  receiverAddress!: string;
  receiverEmail!: string;
  receiverContact!: string;
  receiverMobileAccountNumber!: string;
  receiverCurrency: string = '';
  amountToBeReceived: string = '0';
  estimation: number = 0;
  waitingEstimation: boolean = true;
  waitingRates: boolean = true;
  rates: any;
  raisonForTransfer: string = '';
  waitingSystemData: boolean = true;
  bankList: any;
  selectedBank: any;
  waitingBankList: boolean = true;
  gettingPaymentMethods: any = true;
  paymentMethodsList: any[] = [];
  paymentMethodsDisabledList: any[] = [];
  private systemTransferTaxes = 5;

  statusErrorMsg: any = [];
  bankAccountNumber: string = '';
  bankCode: string = '';
  canNext2Val: boolean = false;
  goToProceed: boolean = false;
  txRef: string;
  redirect_url: string = '';
  showRetry: boolean = false;
  modalClosed: boolean = false;
  reOpen: boolean = false;
  transactionSucceded: boolean = false;
  transactionFailed: boolean = false;
  private pollTimer: any;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  constructor(
    private _formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private datePipe: DatePipe,
    private systemService: SystemService,
    private translate: TranslateService,
    private userService: UserService,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private exchange: ExchangeService,
    private location: LocationService,
    private fw: FlutterwaveService,
    private fieldValidationService: FieldValidationService,
    private paymentMethodsService: PaymentMethodsService,
  ) {
    this.estimation = 0;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((datas: any) => {
      this.getCurrentUser();
      this.transactionRef = this.paymentService.generateId();
      this.currentDate = this.formatDate(new Date());
      setTimeout(() => {
        this.scrollToTop();
      }, 100);
    });
  }

  getPaymentMethods(countryId) {
    if (!countryId) {
      this.paymentMethodsList = [];
      this.gettingPaymentMethods = false;
      return;
    }
    this.gettingPaymentMethods = true;
    this.paymentMethodsService
      .getPaymentMethodsByCountryId(countryId)
      .subscribe((resp: any) => {
        if (resp && Array.isArray(resp)) {
          this.paymentMethodsList = resp.filter(
            (method) => method?.statusPayout !== false,
          );
          this.paymentMethodsDisabledList = resp.filter(
            (method) => method?.statusPayout === false,
          );
          this.syncSelectedMethodAfterLoad();
        } else {
          this.paymentMethodsList = [];
        }
        this.gettingPaymentMethods = false;
      });
  }

  formatAccountNumber(event: any) {
    let value = event.target.value.replace(/ /g, '');
    if (value.length > 4) {
      value = value.match(/.{1,4}/g).join(' ');
    }
    this.bankAccountNumber = value;
    this.canNext2();
  }

  startPolling() {
    if (!this.txRef) return;
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.transactionSucceded = false;
    this.transactionFailed = false;

    this.pollTimer = setInterval(async () => {
      try {
        this.paymentService.getPayinByTxRef(this.txRef).subscribe((resp: any) => {
          this.handlePayinStatus(resp);
        });
      } catch (err) {
        console.warn('polling error', err);
      }
    }, 5 * 1000);
  }

  handlePayinStatus(resp: any) {
    const status =
      resp?.data?.data?.status ||
      resp?.data?.status ||
      resp?.status ||
      'pending';
      // console.log('resp: ', resp);
      // console.log('status: ', status);
    if (['successful', 'success'].includes(status.toLowerCase())) {
      this.transactionSucceded = true;
      this.transactionFailed = false;
      clearInterval(this.pollTimer);
    }
    if (['cancelled'].includes(status.toLowerCase())) {
      this.transactionSucceded = false;
      this.transactionFailed = true;
      clearInterval(this.pollTimer);
    }
    if (['failed'].includes(status.toLowerCase())) {
      this.transactionSucceded = false;
      this.transactionFailed = true;
      // clearInterval(this.pollTimer);
    }
  }

  getBanksList(countryIso2) {
    // console.log('country iso2: ', countryIso2)
    this.waitingBankList = true;
    this.fw.getBanksList(countryIso2).subscribe((res: any) => {
      this.waitingBankList = false;
      this.bankList = res;
      // console.log('bank list: ', res)
    });
  }

  formatAmount(event: any) {
    let value = event.target.value.replace(/\s/g, ''); // delete existing space
    value = value.replace(/\D/g, ''); // delete all not number

    // Add space after 3 number
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Update input patern
    this.amountToBeReceived = value;
    event.target.value = value;
  }

  getCleanAmount(): number {
    const cleanValue = this.amountToBeReceived.replace(/\s/g, '');
    return (this.newPayment = parseFloat(cleanValue) || 0);
  }

  convertCurrency() {
    this.estimation = 0;
    this.waitingEstimation = true;
    const toCurrency = this.currentUser?.countryId?.currency || 'XAF';
    const fromCurrency = this.selectedCountry?.currency || 'XAF';
    if (fromCurrency === toCurrency) {
      this.estimation = this.getCleanAmount();
      this.waitingEstimation = false;
    } else
      this.proceedCurrencyConvertion(
        fromCurrency,
        toCurrency,
        this.getCleanAmount(),
      );
  }

  proceedCurrencyConvertion(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
  ) {
    this.waitingEstimation = true;
    if (this.rates) {
      const estimation = this.localConversion(
        this.rates,
        fromCurrency,
        toCurrency,
        amount,
      );
      this.estimation = Math.ceil(estimation);
      this.waitingEstimation = false;
    } else {
      this.getRates();
    }
  }

  getRates() {
    this.waitingRates = true;
    return this.exchange.getExchangeRate().subscribe((res) => {
      this.rates = res.rates;
      if (this.selectedCountry) {
        this.estimation = this.localConversion(
          this.rates,
          this.currentUser?.countryId?.currency || 'XAF',
          this.selectedCountry?.currency || 'XAF',
          this.getCleanAmount(),
        );
      }
      this.waitingEstimation = false;
      this.waitingRates = false;
      this.waitingExchangeRate = false;
    });
  }

  localConversion(
    rates: any,
    fromCurrency: string,
    toCurrency: string,
    amount: number,
  ) {
    return this.exchange.localConvertion(
      rates,
      fromCurrency,
      toCurrency,
      amount,
    );
  }

  getLocations() {
    this.waitingLocations = true;
    this.location
      .getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => {
        if (countries) {
          this.availableCountries = countries.sort((a, b) =>
            a.name.localeCompare(b.name),
          );

          let selectedCountry: any;
          if (this.idParam) {
            this.selectedCountry = this.availableCountries.find(
              (e) => String(e._id) === String(this.idParam),
            );
          }

          if (
            !selectedCountry &&
            this.currentUser &&
            this.currentUser.countryId
          ) {
            selectedCountry = this.availableCountries.find(
              (e) => e._id === this.currentUser.countryId._id,
            );
          }

          this.setSelectedCountry(this.selectedCountry);
          this.waitingLocations = false;
        } else {
          this.systemService.getStaticData().then(() => {
            setTimeout(() => {
              this.getLocations();
              window.location.reload();
            }, 10 * 1000);
          });
        }
      });
  }

  initForm(eventData: any) {
    const formContactControls: any = {
      paymentMethodNumber: [
        this.currentUser?.phone ? this.currentUser?.phone : 0,
        [
          Validators.required,
          this.fieldValidationService.phoneValidator(
            () => String(this.currentUser?.countryId?.code || '237'),
          ),
        ],
      ],
    };
  }

  // calculateSubtotal(): number {
  //   this.newPayment + this.taxesValueCalculation();

  //   return this.aroundValue(this.newPayment + this.taxesValueCalculation());
  // }

  
  toggleDescription() {
    this.showDescription = !this.showDescription;
  }

  calculateTaxesAmount(): number {
    return this.aroundValue(this.estimation * (this.getTransferTaxRate() / 100));
  }

  aroundValue(val) {
    return Math.ceil(val);
  }

  paymentWithTaxesCalculation() {
    return this.aroundValue(this.estimation + this.calculateTaxesAmount());
  }

  canNext(): boolean {
    if (!this.selectedCountry) return false;
    this.receiverName = this.receiverFirstName + ' ' + this.receiverLastName;
    this.receiverCurrency = this.selectedCountry?.currency || 'XAF';
    const amountValid = this.fieldValidationService.isValidAmount(
      this.amountToBeReceived,
      this.receiverCurrency,
    );

    if (
      !amountValid ||
      this.waitingEstimation ||
      this.waitingUserData ||
      this.waitingExchangeRate
    )
      return false;
    if (
      !this.isPhoneValid(this.receiverContact, this.selectedCountry?.code) ||
      !this.minLength(this.receiverAddress) ||
      !this.minLength(this.receiverName) ||
      this.receiverEmail && !this.isEmailValid(this.receiverEmail) ||
      !this.raisonForTransfer
    )
      return false;
    return true;
  }

  scrollToTop(): void {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  canNext2(): boolean {
    if (!this.canNext()) return false;
    const operator = this.getSelectedOperator();
    if (operator === 'UNKNOWN') {
      return (this.canNext2Val = false);
    }
    if (operator === 'BANK') {
      if (this.bankAccountNumber && this.bankCode)
        return (this.canNext2Val = true);
    } else {
      if (!this.receiverMobileAccountNumber) this.canNext2Val = false;
      if (operator === 'MPESA')
        return (this.canNext2Val = this.fieldValidationService.isValidOperatorPhone(
          this.receiverMobileAccountNumber,
          this.selectedCountry?.code,
          'MPESA',
        ));
      if (operator === 'MTN' && this.isValidMTNPhoneNumber(this.receiverMobileAccountNumber))
        return (this.canNext2Val = true);
      if (operator === 'OM' && this.isValidOrangePhoneNumber(this.receiverMobileAccountNumber))
        return (this.canNext2Val = true);
    }
    return (this.canNext2Val = false);
  }

  minLength(data) {
    return data?.length >= 4;
  }

  isEmailValid(email) {
    return this.fieldValidationService.isValidEmail(email);
  }

  isPhoneValid(receiverContact, countryCode) {
    return this.fieldValidationService.isValidPhoneForCountry(receiverContact, countryCode);
  }
  
  canSubmit(): boolean {
    if (this.canNext() && this.canNext2()) return true;
    else return false;
  }

  updateCalculations() {
    // This method is called every time the quantity changes
  }

  getCurrentUser() {
    this.waitingUserData = true;
    this.userService.getCurrentUserData().then((user: any) => {
      if (user) {
        // console.log('user: ', user)
        this.currentUser = user;
        this.selectedCountry = this.currentUser.countryId;
        this.raisonForTransfer = this.currentUser.language === 'fr' ? 'Soutient financier familliale.' : 'Financial family support.';
        this.waitingUserData = false;
        // this.selectedMethod = this.choseDefaultMethod(this.selectedCountry.currency);
        this.getId();
        this.getRates();
        this.getSystemData();
      } else {
        this.currentUser = undefined;
        this.waitingUserData = false;
        this.waitingSystemData = false;
        this.toastService.presentToast(
          'error',
          'Unautorized',
          'You must be logged in to make a transfer',
        );
        this.router.navigate(['/tabs']);
      }
    });
  }

  choseDefaultMethod(currency: string): string {
    if (['KES'].includes(currency)) return 'MPESA';
    if (['XAF', 'XOF'].includes(currency)) return 'MTN';
    return 'BANK';
  }
  
  getId() {
    const idParam = this.route.snapshot.paramMap.get('id');

    // Vérifier si idParam existe et n'est pas null/undefined
    if (idParam && idParam !== 'null' && idParam !== 'undefined') {
      this.idParam = idParam;
    } else {
      // Utiliser la valeur par défaut avec vérification de sécurité
      if (
        this.currentUser &&
        this.currentUser.countryId &&
        this.currentUser.countryId._id
      ) {
        this.idParam = this.currentUser.countryId._id;
      } else {
        console.error('currentUser.countryId._id is not available');
        // Fallback vers une valeur par défaut ou gérer l'erreur
        this.idParam = null;
      }
    }

    return this.getLocations();
  }

  formatDate(date: Date) {
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control: any) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  showName(userData: any): string {
    return this.userService.showName(userData);
  }

  async onSubmit() {
    this.setTransactionData();
    if (this.verifytransactionData(this.transactionData) === false) return;
    this.proceed = true;

    await this.fw.loadFlutterwaveScript();
    this.paymentService
      .proceedPayment(this.transactionData)
      .subscribe((res: any) => {
        if (!res) {
          this.proceed = false;
          this.toastService.presentToast('error', 'Error', res.message);
        } else {
          this.txRef = res.txRef;
          this.redirect_url = res.redirect_url;
          this.handleRequest();
        }
      });
  }

  openModal() {
    this.showRetry = false;
    setTimeout(() => {
      this.showRetry = true;
      this.reOpen = false;
    }, 10000);
    this.startPolling();
    return window.open(this.redirect_url, '_blank', 'width=800,height=800');
  }

  handleRequest() {
    if (this.redirect_url) {
      const payWin = this.openModal();
      if (!payWin) {
        location.href = this.redirect_url;
        return;
      }

      // monitor the closure and do a server-side check
      const timer = setInterval(async () => {
        if (payWin.closed) {
          clearInterval(timer);
          // small check to update the UI (statut PENDING/ABANDONED)
          this.paymentService.getPayinByTxRef(this.txRef).subscribe((resp: any) => {
            this.handlePayinStatus(resp);
          });
          try {
            this.modalClosed = true;
            // this.verifyAndClosePayin();
          } catch {}
          // TODO: display a "payment canceled" message or refresh the status
        }
      }, 600);
    } else {
      this.toastService.presentToast('error', 'Error', '');
    }
  }

  openPayin() {
    this.reOpen = true;
    this.transactionSucceded = false;
    this.transactionFailed = false;
    this.paymentService.openPayin(this.txRef).subscribe((res: any) => {
      if (res && res.status === 'pending') {
        return this.handleRequest();
      }
      return this.toastService.presentToast('error', 'Error', '');
    });
  }

  // verifyAndClosePayin() {
  //   this.paymentService
  //     .verifyAndClosePayin(this.txRef)
  //     .subscribe((res: any) => {
  //       if (res) {
  //         if (res.status === 'successful' || res.status === 'success') {
  //           this.transactionSucceded = true;
  //           this.transactionFailed = false;
  //         } else if (res.status === 'failed') {
  //           this.transactionSucceded = false;
  //           this.transactionFailed = true;
  //         } else {
  //           this.transactionSucceded = false;
  //           this.transactionFailed = false;
  //         }
  //         // this.proceed = false;
  //         // this.toastService.presentToast('warning', 'Transaction', res.message);
  //         // this.router.navigate(['/tabs']);
  //       } else {
  //         this.toastService.presentToast('error', 'Error', res.message);
  //       }
  //     });
  // }

  getSystemData() {
    this.waitingSystemData = true;
    this.systemService.getSystemData().subscribe((resp: any) => {
      this.systemTransferTaxes = resp ? resp.invoiceTaxes : 0;
      this.invoiceTaxes = this.systemTransferTaxes;
      this.waitingSystemData = false;
    });
  }

  setTransactionData() {
    if (!this.selectedCountry || !this.currentUser) return;
    const operator = this.getSelectedOperator();
    if (operator === 'MTN') {
      this.bankAccountNumber =
        this.selectedCountry?.code + this.receiverMobileAccountNumber;
      this.bankCode = 'MTN';
    } else if (operator === 'OM') {
      this.bankAccountNumber =
        this.selectedCountry?.code + this.receiverMobileAccountNumber;
      this.bankCode = 'ORANGEMONEY';
    } else if (operator === 'MPESA') {
      this.bankAccountNumber =
        this.selectedCountry?.code + this.receiverMobileAccountNumber;
      this.bankCode = 'MPESA';
    }
    this.transactionData = {
      transactionRef: this.transactionRef,
      estimation: this.estimation,
      invoiceTaxes: this.invoiceTaxes,
      taxesAmount: this.calculateTaxesAmount(),
      paymentWithTaxes: this.paymentWithTaxesCalculation(),

      senderId: this.currentUser._id,
      senderName: this.showName(this.currentUser),
      senderEmail: this.currentUser.email,
      senderContact: this.currentUser.phone,
      senderCountry: this.currentUser.countryId.name,
      senderCountryCode: this.currentUser.countryId.code,
      senderCurrency: this.currentUser.countryId.currency,

      raisonForTransfer: this.raisonForTransfer,
      userId: this.currentUser._id,

      receiverName: this.receiverName,
      receiverEmail: this.receiverEmail || 'no-email@digikuntz.com',
      receiverContact: this.receiverContact,
      receiverAddress: this.receiverAddress,
      receiverCountry: this.selectedCountry.name,
      receiverCurrency: this.selectedCountry.currency,
      receiverCountryCode: this.selectedCountry?.code,
      // receiverAccountType: this.getreceiverAccountType(),
      receiverAmount: this.getCleanAmount(),

      paymentMethod: this.selectedMethod?.code || operator,
      receiverMobileAccountNumber: this.receiverMobileAccountNumber,
      bankAccountNumber:
        this.bankAccountNumber?.replaceAll(' ', '') || undefined,
      bankCode: this.bankCode,

      status: this.paymentService.status.INITIALIZED,
      transactionType: this.paymentService.transactionType.TRANSFER,
    };
  }

  getreceiverAccountType() {
    const operator = this.getSelectedOperator();
    if (['OM', 'MTN', 'MPESA'].includes(operator)) return 'mobile_money';
    if (operator === 'BANK') return 'bank';
    return 'wallet';
  }

  verifytransactionData(transactionData): boolean {
    // remove all characteres witch are not a number
    // transactionData.paymentMethodNumber =
    //   transactionData.paymentMethodNumber.replace(/\D/g, "");

    // Phone number verification: Orange Cameroon
    const operator = this.resolveOperatorFromPaymentMethod(transactionData.paymentMethod);
    if (
      operator === 'OM' &&
      !this.fieldValidationService.isValidOperatorPhone(
        transactionData.receiverMobileAccountNumber,
        this.selectedCountry?.code,
        'OM',
      )
    ) {
      this.translate.get('payment.notOmNumber').subscribe((res: string) => {
        this.toastService.presentToast('warning', 'Warning', res);
      });
      return false;
    } else if (
      operator === 'MTN' &&
      !this.fieldValidationService.isValidOperatorPhone(
        transactionData.receiverMobileAccountNumber,
        this.selectedCountry?.code,
        'MTN',
      )
    ) {
      this.translate.get('payment.notMTNNumber').subscribe((res: string) => {
        this.toastService.presentToast('warning', 'Warning', res);
      });
      return false;
    }

    // const userCurrency = this.currentUser?.countryId?.currency || 'XAF';
    // const estimation = this.fieldValidationService.parseAmount(
    //   transactionData?.estimation,
    // );
    // if (!this.fieldValidationService.isValidAmount(this.amountToBeReceived, userCurrency)) {
    //   this.toastService.presentToast(
    //     'warning',
    //     'Warning',
    //     `Montant invalide (${this.fieldValidationService.getRangeMessage(userCurrency)})`,
    //   );
    //   return false;
    // }

    return true;
  }

  // Phone number verification
  isValidPhoneNumber(phone: string): boolean {
    return this.fieldValidationService.isValidPhoneForCountry(
      phone,
      this.selectedCountry?.code,
    );
  }

  // Phone number verification: Orange Cameroon
  isValidOrangePhoneNumber(phone: string): boolean {
    return this.fieldValidationService.isValidOperatorPhone(
      phone,
      this.selectedCountry?.code,
      'OM',
    );
  }

  // Phone number verification: MTN Cameroon
  isValidMTNPhoneNumber(phone: string): boolean {
    return this.fieldValidationService.isValidOperatorPhone(
      phone,
      this.selectedCountry?.code,
      'MTN',
    );
  }

  /**
   * Manage transaction response.
   */
  // private handleRequest(transactionData) {
  //   if (transactionData.reqStatus === ReqStatus.PENDING) {
  //     this.router.navigate(['/tabs/proceed-transfer/' + transactionData._id]);
  //   } else if (transactionData.reqStatus === ReqStatus.ERROR) {
  //     this.toastService.presentToast(
  //       transactionData.message,
  //       'top',
  //       'danger',
  //       10000,
  //     );
  //   } else {
  //     this.toastService.presentToast('Error', 'top', 'danger');
  //   }
  //   this.proceed = false;
  // }

  backClicked() {
    this.router.navigate(['/tabs/home']);
  }

  selectMethod(method: any) {
    if (!method || method?.statusPayin === false) {
      return;
    }
    this.selectedMethod = method;
    this.invoiceTaxes = Number(method?.taxesTransfer ?? this.systemTransferTaxes ?? 0);
    this.bankCode = undefined;
    this.bankAccountNumber = undefined;

    // Keep a usable default for mobile methods from step1 beneficiary number.
    if (this.isMobileMethod(method)) {
      const fallbackPhone = this.receiverMobileAccountNumber || this.receiverContact;
      this.receiverMobileAccountNumber =
        this.fieldValidationService.normalizePhoneDigits(fallbackPhone);
    }

    this.setTransactionData();
    this.canNext2();
  }

  // continue() {
  //   if (this.selectedMethod === "OM") {
  //     this.router.navigate(["/orange-money"]);
  //   } else {
  //     this.router.navigate(["/payment-confirmation"]);
  //   }
  // }

  nextStep() {
    if (this.step === 2) {
      this.setTransactionData();
      if (!this.verifytransactionData(this.transactionData)) return;
    }

    // Guard transitions with actual business validators used by buttons.
    if (this.step === 1 && !this.canNext()) {
      return;
    }

    if (this.step === 1) {
      if (this.selectedCountry) this.getBanksList(this.selectedCountry.iso2);
      this.prefillStep2DataFromReceiver();
      this.getPaymentMethods(this.selectedCountry?._id);
    }

    if (this.step === 2 && !this.canNext2()) {
      return;
    }

    if (this.step <= 3) {
      this.step++;
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  // Méthode pour réinitialiser le stepper
  stepperToProceed() {
    this.goToProceed = true;
    this.scrollToTop();
    setTimeout(() => {
      this.onSubmit();
    }, 2000);
  }

  resetStepper() {
    this.step = 1;
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
  }

  canProceedToNextStep(): boolean {
    switch (this.step) {
      case 1:
        return this.firstFormGroup.valid && this.canNext();
      case 2:
        return this.secondFormGroup.valid && this.canNext2();
      default:
        return true;
    }
  }

  fotmatForBr(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  /**
   * Filters cities based on selected country.
   * @param country The selected country object.
   */
  onSelect(event: Event) {
    const countryId = (event.target as HTMLSelectElement).value;
    const selectedCountry = this.availableCountries.filter(
      (e) => e._id === countryId,
    );
    this.setSelectedCountry(selectedCountry[0]);
  }

  /**
   * Filters cities based on selected country.
   * @param bank The selected country object.
   */
  onSelectBank(event: Event) {
    const bankCode = (event.target as HTMLSelectElement).value;
    const selected = this.bankList.filter((e) => e.code === bankCode);
    this.selectedBank = selected[0];
    this.bankCode = this.selectedBank?.code || '';
  }

  setSelectedCountry(countryData: any) {
    if (!countryData) {
      console.warn(
        'Aucun pays sélectionné, utilisation des valeurs par défaut',
      );
      // Utiliser les valeurs par défaut de l'utilisateur
      if (this.currentUser && this.currentUser.countryId) {
        this.selectedCountry = this.currentUser.countryId;
        this.flagCountry =
          this.currentUser.countryId.flagUrl || 'assets/img/resources/flag.png';
        this.receiverCurrency = this.currentUser.countryId.currency || 'XAF';
      } else {
        // Valeurs de fallback absolues
        this.selectedCountry = { name: 'Cameroun', currency: 'XAF' };
        this.flagCountry = 'assets/img/resources/flag.png';
        this.receiverCurrency = 'XAF';
      }
    } else {
      this.selectedCountry = countryData;
      this.flagCountry = countryData.flagUrl || 'assets/img/resources/flag.png';
      this.receiverCurrency = countryData.currency || '--';
    }
    this.bankList = [];
    this.paymentMethodsList = [];
    this.selectedMethod = undefined;
    this.selectedBank = undefined;
    this.bankCode = undefined;
    this.bankAccountNumber = undefined;
    this.receiverMobileAccountNumber = undefined;
    // if (this.selectedCountry?.currency === 'KES') {
    //   this.selectedMethod = 'MPESA';
    // } else {
    //   this.selectedMethod = 'BANK';
    // }

    this.convertCurrency();
  }

  private isMobileMethod(method?: any): boolean {
    const operator = this.getMethodOperator(method);
    return ['MTN', 'OM', 'MPESA'].includes(operator);
  }

  private detectMethodFromReceiverPhone(phoneDigits: string): string {
    const countryCode = this.selectedCountry?.code;
    const currency = this.selectedCountry?.currency || 'XAF';

    if (this.fieldValidationService.isValidOperatorPhone(phoneDigits, countryCode, 'OM')) {
      return 'OM';
    }
    if (this.fieldValidationService.isValidOperatorPhone(phoneDigits, countryCode, 'MTN')) {
      return 'MTN';
    }
    if (this.fieldValidationService.isValidOperatorPhone(phoneDigits, countryCode, 'MPESA')) {
      return 'MPESA';
    }

    return this.choseDefaultMethod(currency);
  }

  private prefillStep2DataFromReceiver(): void {
    const receiverDigits = this.fieldValidationService.normalizePhoneDigits(
      this.receiverContact,
    );
    if (!receiverDigits) {
      return;
    }

    this.receiverMobileAccountNumber = receiverDigits;
    const detectedOperator = this.detectMethodFromReceiverPhone(receiverDigits);
    const foundMethod = this.findMethodByOperator(detectedOperator);
    if (foundMethod) {
      this.selectMethod(foundMethod);
    }
    this.canNext2();
  }

  private syncSelectedMethodAfterLoad(): void {
    if (!Array.isArray(this.paymentMethodsList) || this.paymentMethodsList.length < 1) {
      this.selectedMethod = undefined;
      this.invoiceTaxes = this.systemTransferTaxes;
      return;
    }

    const receiverDigits = this.fieldValidationService.normalizePhoneDigits(this.receiverContact);
    const detectedOperator = receiverDigits ? this.detectMethodFromReceiverPhone(receiverDigits) : this.choseDefaultMethod(this.selectedCountry?.currency);
    const preferred = this.findMethodByOperator(detectedOperator) || this.paymentMethodsList[0];
    this.selectMethod(preferred);
  }

  private findMethodByOperator(operator: string): any {
    if (!Array.isArray(this.paymentMethodsList)) {
      return undefined;
    }
    return this.paymentMethodsList.find((m) => this.getMethodOperator(m) === operator);
  }

  getSelectedOperator(): string {
    return this.getMethodOperator(this.selectedMethod);
  }

  getMethodOperator(method: any): string {
    const code = String(method?.code || '').toUpperCase();
    const provider = String(method?.provider || '').toUpperCase();
    const name = String(method?.name || '').toUpperCase();
    const type = String(method?.type || '').toUpperCase();

    if (code.includes('MPESA') || provider.includes('PAYSTACK') || name.includes('M-PESA') || name.includes('MPESA')) {
      return 'MPESA';
    }
    if (code.includes('OM') || name.includes('ORANGE')) {
      return 'OM';
    }
    if (code.includes('MTN') || name.includes('MTN')) {
      return 'MTN';
    }
    if (type === 'BANK' || code.includes('BANK')) {
      return 'BANK';
    }
    return 'UNKNOWN';
  }

  private resolveOperatorFromPaymentMethod(paymentMethod: string): string {
    const upper = String(paymentMethod || '').toUpperCase();
    if (['OM', 'MTN', 'MPESA', 'BANK'].includes(upper)) {
      return upper;
    }
    return this.getMethodOperator({ code: upper, provider: upper, name: upper });
  }

  getTransferTaxRate(): number {
    return Number(this.selectedMethod?.taxesTransfer ?? this.systemTransferTaxes ?? 0);
  }

  navigateTo(route) {
    this.ngOnDestroy();
    this.router.navigate([route]);
  }

  isPaystackCurrency(currency?: string): boolean {
    const normalized = (currency || '').toUpperCase();
    return normalized === 'KES';
  }

  getPaymentProviderName(currency?: string): string {
    return this.isPaystackCurrency(currency) ? 'Paystack' : 'Flutterwave';
  }
  
  /**
   * Cleans up data when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.pollTimer);
  }
}
