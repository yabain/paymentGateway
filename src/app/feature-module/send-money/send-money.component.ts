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
declare var FlutterwaveCheckout: any;

@Component({
  selector: 'app-send-money',
  templateUrl: './send-money.component.html',
  styleUrls: ['./send-money.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SendMoneyComponent implements OnInit {
  selectedMethod: string = 'BANK';
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
  flagCountry: string = 'assets/ressorces/flag.png';
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
  watingEstimation: boolean = true;
  watingRates: boolean = true;
  rates: any;
  raisonForTransfer: string = '';
  waitingSystemData: boolean = true;
  bankList: any;
  selectedBank: any;
  waitingBankList: boolean = true;

  statusErrorMsg: any = [];
  methodName: string = 'Bank transfer';
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
  ) {
    this.estimation = 0;
    this.getSolde();
  }

  getSolde() {
    this.fw.getApplicationBalance('NGN').subscribe((resp: any) => {
      console.log('wallet NGN: ', resp);
    });
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

  getMethodName(method) {
    if (method === 'OM') {
      this.methodName = 'Orange Money';
    } else if (method === 'MTN') {
      this.methodName = 'MTN Mobile Money';
    } else if (method === 'CARD') {
      this.methodName = 'Card Payment';
    } else if (method === 'PAYPAL') {
      this.methodName = 'PayPal';
    } else {
      this.methodName = 'Bank Transfer';
    }
    return this.methodName;
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
        this.fw.checkStatus(this.txRef).subscribe((resp: any) => {
          const status =
            resp?.data?.data?.status ||
            resp?.data?.status ||
            resp?.status ||
            'pending';
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
        });
      } catch (err) {
        console.warn('polling error', err);
      }
    }, 5000);
  }

  getBanksList(countryIso2) {
    this.waitingBankList = true;
    this.fw.getBanksList(countryIso2).subscribe((res: any) => {
      this.waitingBankList = false;
      this.bankList = res;
      console.log('bank list: ', res)
    });
  }

  formatAmount(event: any) {
    let value = event.target.value.replace(/\s/g, ''); // Supprime les espaces existants
    value = value.replace(/\D/g, ''); // Supprime tout ce qui n'est pas un chiffre

    // Ajoute un espace tous les 3 chiffres
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Met à jour la valeur dans le modèle et l'input
    this.amountToBeReceived = value;
    event.target.value = value;
  }

  getCleanAmount(): number {
    const cleanValue = this.amountToBeReceived.replace(/\s/g, '');
    return (this.newPayment = parseFloat(cleanValue) || 0);
  }

  convertCurrency() {
    this.estimation = 0;
    this.watingEstimation = true;
    const toCurrency = this.currentUser?.countryId?.currency || 'XAF';
    const fromCurrency = this.selectedCountry?.currency || 'XAF';
    if (fromCurrency === toCurrency) {
      this.estimation = this.getCleanAmount();
      this.watingEstimation = false;
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
    this.watingEstimation = true;
    if (this.rates) {
      const estimation = this.localConversion(
        this.rates,
        fromCurrency,
        toCurrency,
        amount,
      );
      this.estimation = Math.ceil(estimation);
      this.watingEstimation = false;
    } else {
      this.getRates();
    }
  }

  getRates() {
    this.watingRates = true;
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
      this.watingEstimation = false;
      this.watingRates = false;
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
        [Validators.required, Validators.pattern(/^[0-9]{9}$/)],
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
    return this.aroundValue(this.estimation * (this.invoiceTaxes / 100));
  }

  aroundValue(val) {
    return Math.ceil(val);
  }

  paymentWithTaxesCalculation() {
    return this.aroundValue(this.estimation + this.calculateTaxesAmount());
  }

  canNext(): boolean {
    this.receiverName = this.receiverFirstName + ' ' + this.receiverLastName;
    // return true;
    if (
      this.estimation < 50 ||
      this.watingEstimation ||
      this.waitingUserData ||
      this.waitingExchangeRate ||
      this.estimation > 500000
    )
      return false;
    if (
      !this.receiverContact ||
      !this.minLength(this.receiverAddress) ||
      !this.minLength(this.receiverName) ||
      !this.isEmailValide(this.receiverEmail) ||
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
    this.setTransactionData();
    if (this.selectedMethod === 'BANK') {
      if (this.bankAccountNumber && this.bankCode)
        return (this.canNext2Val = true);
    } else {
      if (!this.receiverMobileAccountNumber) this.canNext2Val = false;
      if (
        this.selectedMethod === 'MTN' &&
        this.isValidMTNPhoneNumber(this.receiverMobileAccountNumber)
      )
        return (this.canNext2Val = true);
      if (
        this.selectedMethod === 'OM' &&
        this.isValidOrangePhoneNumber(this.receiverMobileAccountNumber)
      )
        return (this.canNext2Val = true);
    }
    return (this.canNext2Val = false);
  }

  minLength(data) {
    return data?.length >= 4;
  }

  isEmailValide(email) {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexEmail.test(email);
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
        this.currentUser = user;
        this.waitingUserData = false;
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
    if (!this.verifytransactionData(this.transactionData)) return;
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

      // 3) optionnel : surveiller la fermeture et faire une vérif côté serveur
      const timer = setInterval(async () => {
        if (payWin.closed) {
          clearInterval(timer);
          this.transactionSucceded = false;
          this.transactionFailed = false;
          // petite vérification pour mettre l’UI à jour (statut PENDING/ABANDONED)
          try {
            this.modalClosed = true;
            this.verifyAndClosePayin();
          } catch {}
          // TODO: afficher un message "paiement annulé" ou rafraîchir l’état
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

  verifyAndClosePayin() {
    this.paymentService
      .verifyAndClosePayin(this.txRef)
      .subscribe((res: any) => {
        if (res) {
          if (res.status === 'successful' || res.status === 'success') {
            this.transactionSucceded = true;
            this.transactionFailed = false;
          } else if (res.status === 'failed') {
            this.transactionSucceded = false;
            this.transactionFailed = true;
          } else {
            this.transactionSucceded = false;
            this.transactionFailed = false;
          }
          // this.proceed = false;
          // this.toastService.presentToast('warning', 'Transaction', res.message);
          // this.router.navigate(['/tabs']);
        } else {
          this.toastService.presentToast('error', 'Error', res.message);
        }
      });
  }

  getSystemData() {
    this.waitingSystemData = true;
    this.systemService.getSystemData().subscribe((resp: any) => {
      this.invoiceTaxes = resp ? resp.invoiceTaxes : 0;
      this.waitingSystemData = false;
    });
  }

  setTransactionData() {
    if (this.selectedMethod === 'MTN') {
      this.bankAccountNumber =
        this.selectedCountry.code + this.receiverMobileAccountNumber;
      this.bankCode = 'MTN';
    } else if (this.selectedMethod === 'OM') {
      this.bankAccountNumber =
        this.selectedCountry.code + this.receiverMobileAccountNumber;
      this.bankCode = 'ORANGEMONEY';
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
      senderCurrency: this.currentUser.countryId.currency,

      raisonForTransfer: this.raisonForTransfer,
      userId: this.currentUser._id,

      receiverName: this.receiverName,
      receiverEmail: this.receiverEmail,
      receiverContact: this.receiverContact,
      receiverAddress: this.receiverAddress,
      receiverCountry: this.selectedCountry.name,
      receiverCurrency: this.selectedCountry.currency,
      receiverAmount: this.getCleanAmount(),

      paymentMethod: this.selectedMethod,
      receiverMobileAccountNumber: this.receiverMobileAccountNumber,
      bankAccountNumber:
        this.bankAccountNumber?.replaceAll(' ', '') || undefined,
      bankCode: this.bankCode,

      status: this.paymentService.status.INITIALIZED,
      transactionType: this.paymentService.transactionType.TRANSFER,
    };
  }

  verifytransactionData(transactionData): boolean {
    // remove all characteres witch are not a number
    // transactionData.paymentMethodNumber =
    //   transactionData.paymentMethodNumber.replace(/\D/g, "");

    // Phone number verification: Orange Cameroon
    if (
      transactionData.paymentMethod === 'OM' &&
      !this.isValidOrangePhoneNumber(
        transactionData.receiverMobileAccountNumber,
      )
    ) {
      this.translate.get('payment.notOmNumber').subscribe((res: string) => {
        this.toastService.presentToast('warning', 'Warning', res);
      });
      return false;
    } else if (
      transactionData.paymentMethod === 'MTN' &&
      !this.isValidMTNPhoneNumber(transactionData.receiverMobileAccountNumber)
    ) {
      this.translate.get('payment.notMTNNumber').subscribe((res: string) => {
        this.toastService.presentToast('warning', 'Warning', res);
      });
      return false;
    }

    if (transactionData.payment < 10) {
      // If payment amount < 10 FCFA
      this.translate.get('payment.minimalAmount').subscribe((res: string) => {
        this.toastService.presentToast('warning', 'Warning', res);
      });
      return false;
    }

    return true;
  }

  // Phone number verification
  isValidPhoneNumber(phone: string): boolean {
    if (this.selectedCountry.code !== '237') return true;
    // Chech if string has exactly 9 numbers
    const isNineDigits = /^\d{9}$/.test(phone);
    return isNineDigits;
  }

  // Phone number verification: Orange Cameroon
  isValidOrangePhoneNumber(phone: string): boolean {
    if (this.selectedCountry.code !== '237') return true;
    // Check if string start with 655, 656, 657, 658, 659 or 69*
    const orangeRegex = /^6((55|56|57|58|59|86|87|88|89)|9[0-9])\d{6}$/;

    const res = orangeRegex.test(phone);
    // if (this.isValidPhoneNumber(phone) && !res) {
    //   this.translate.get('payment.notOmNumber').subscribe((res: string) => {
    //     this.toastService.presentToast('warning', 'Warning', res);
    //   });
    // }
    return res;
  }

  // Phone number verification: MTN Cameroon
  isValidMTNPhoneNumber(phone: string): boolean {
    if (this.selectedCountry.code !== '237') return true;
    // Check if string start with 650, 651, 652, 653, 654, 67* or 680*
    const mtnRegex = /^6((50|51|52|53|54)|7[0-9]|8[0-5])\d{6}$/;

    const res = mtnRegex.test(phone);
    // if (this.isValidPhoneNumber(phone) && !res) {
    //   this.translate.get('payment.notMTNNumber').subscribe((res: string) => {
    //     this.toastService.presentToast('warning', 'Warning', res);
    //   });
    // }
    return res;
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

  selectMethod(method: string) {
    if (method === 'card' || method === 'paypal') {
      return;
    }
    this.selectedMethod = method;
    this.getMethodName(method);
    this.bankCode = undefined;
    this.bankAccountNumber = undefined;
    this.receiverMobileAccountNumber = undefined;
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

    // Vérifier la validité du formulaire avant de passer à l'étape suivante
    if (this.step === 1 && !this.firstFormGroup.valid) {
      this.markFormGroupTouched(this.firstFormGroup);
      return;
    }

    if (this.step === 2 && !this.secondFormGroup.valid) {
      this.markFormGroupTouched(this.secondFormGroup);
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
          this.currentUser.countryId.flagUrl || 'assets/ressorces/flag.png';
        this.receiverCurrency = this.currentUser.countryId.currency || 'XAF';
      } else {
        // Valeurs de fallback absolues
        this.selectedCountry = { name: 'Cameroun', currency: 'XAF' };
        this.flagCountry = 'assets/ressorces/flag.png';
        this.receiverCurrency = 'XAF';
      }
    } else {
      this.selectedCountry = countryData;
      this.flagCountry = countryData.flagUrl || 'assets/ressorces/flag.png';
      this.receiverCurrency = countryData.currency || '--';
    }
    this.bankList = [];
    this.selectedBank = undefined;
    this.bankCode = undefined;
    this.bankAccountNumber = undefined;
    this.receiverMobileAccountNumber = undefined;
    if (this.selectedCountry) this.getBanksList(this.selectedCountry.iso2);

    this.convertCurrency();
  }

  navigateTo(route) {
    this.ngOnDestroy();
    this.router.navigate([route]);
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
