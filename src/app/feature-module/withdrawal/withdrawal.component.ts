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
import { SoldeService } from 'src/app/services/solde/solde.service';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

export enum ReqStatus {
  PENDING = 'financial_transaction_pending',
  ERROR = 'financial_transaction_error',
  SUCCESS = 'financial_transaction_success',
}

@Component({
  selector: 'app-withdrawal',
  templateUrl: './withdrawal.component.html',
  styleUrls: ['./withdrawal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WithdrawalComponent implements OnInit {
  selectedMethod: string = 'BANK';
  step: number = 1;
  invoiceTaxes: number = 5;
  currentUser: any | undefined;
  waitingUserData: boolean = true;
  taxesAmount: number = 0;
  invoiceRef: any;
  currentDate: any;
  loadingData: boolean = true;
  proceed: boolean = false;
  transactionData!: any;
  newPayment: number = 0;
  waitingExchangeRate: boolean = true;
  private destroy$ = new Subject<void>();
  receiverMobileAccountNumber!: string;
  receiverCurrency: string = '';
  amountToBeReceived: string = '0';
  estimation: number = 0;
  watingEstimation: boolean = true;
  watingRates: boolean = true;
  rates: any;
  waitingSystemData: boolean = true;

  statusErrorMsg: any = [];
  methodName: string = 'Bank transfer';
  bankAccountNumber: string = '';
  bic: string = '';
  canNext2Val: boolean = false;
  goToProceed: boolean = false;
  waittingSolde: boolean = true;
  solde: number = 0;

  constructor(
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
    private soldeService: SoldeService,
  ) {
    this.estimation = 0;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((datas: any) => {
      console.log('datas router: ', datas);
      this.getCurrentUser();
      this.invoiceRef = this.paymentService.generateId();
      this.currentDate = this.formatDate(new Date());
      setTimeout(() => {
        this.scrollToTop();
      }, 100);
    });
  }


  getSolde(){
    this.waittingSolde = true;
    this.soldeService.getSolde()
    .subscribe((data: any) => {
      console.log('solde: ', data)
      this.solde = data ? data.solde : 0;
      this.waittingSolde = false
    })
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

  getUserName(userData) {
    return this.userService.showName(userData);
  }

  convertCurrency() {
    this.estimation = 0;
    this.watingEstimation = true;
    const toCurrency = this.currentUser?.countryId?.currency || 'XAF';
    const fromCurrency = this.currentUser?.countryId.currency || 'XAF';
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
      this.estimation = this.localConversion(
        this.rates,
        this.currentUser?.countryId?.currency || 'XAF',
        this.currentUser?.countryId?.currency || 'XAF',
        this.getCleanAmount(),
      );
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

  refresh() {}

  initForm(eventData: any) {
    const formContactControls: any = {
      paymentMethodNumber: [
        this.currentUser?.phone ? this.currentUser?.phone : 0,
        [Validators.required, Validators.pattern(/^[0-9]{9}$/)],
      ],
    };
  }

  calculateTaxesAmount(): number {
    console.log('calculateTaxesAmount: ', this.estimation, this.invoiceTaxes);
    return this.aroundValue(this.estimation * (this.invoiceTaxes / 100));
  }

  aroundValue(val) {
    return Math.ceil(val);
  }

  paymentWithTaxesCalculation() {
    return this.aroundValue(this.estimation + this.calculateTaxesAmount());
  }

  canNext(): boolean {
    // return true;
    if (
      this.estimation < 1000 ||
      this.watingEstimation ||
      this.waitingUserData ||
      this.waitingExchangeRate
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
      if (this.bankAccountNumber && this.bic) return (this.canNext2Val = true);
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
    console.log('transaction data: ', this.transactionData);
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
        console.log('user: ', user);
        this.waitingUserData = false;
        this.getRates();
        this.getSystemData();
        this.getSolde();
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

  onSubmit() {
    if (!this.verifytransactionData(this.transactionData)) return;
    this.proceed = true;
    console.log('Payment data:', this.transactionData);
    // return ;
    this.paymentService
      .proceedPayment(this.transactionData)
      .subscribe((res: any) => {
        // console.log('the end of the transaction: ', res);
        if (res.success != true) {
          this.proceed = false;
          this.toastService.presentToast('error', 'Error', res.message);
        } else if (res && res.success === true) {
          // this.handleRequest(res.transactionData);
        }
      });
  }

  getSystemData() {
    this.waitingSystemData = true;
    this.systemService.getSystemData().subscribe((resp: any) => {
      console.log('system data: ', resp);
      this.invoiceTaxes = resp ? resp.invoiceTaxes : 0;
      this.waitingSystemData = false;
    });
  }

  setTransactionData() {
    this.transactionData = {
      invoiceRef: this.invoiceRef,
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

      raisonForTransfer: 'Withdarawal',

      receiverName: this.userService.showName(this.currentUser),
      receiverEmail: this.currentUser.email,
      receiverContact: this.currentUser.phone,
      receiverAddress:
        this.currentUser.cityId.name + ', ' + this.currentUser.countryId.name,
      receiverCountry: this.currentUser.countryId.name,
      receiverCurrency: this.currentUser.countryId.currency,
      receiverAmount: this.getCleanAmount(),

      paymentMethod: this.selectedMethod,
      receiverMobileAccountNumber: this.receiverMobileAccountNumber,
      bankAccountNumber: this.bankAccountNumber,
      bic: this.bic,

      paymentStatus: ReqStatus.PENDING,
    };
    console.log('transactionData: ', this.transactionData);
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
    // Chech if string has exactly 9 numbers
    const isNineDigits = /^\d{9}$/.test(phone);
    return isNineDigits;
  }

  // Phone number verification: Orange Cameroon
  isValidOrangePhoneNumber(phone: string): boolean {
    // Check if string start with 655, 656, 657, 658, 659 or 69*
    const orangeRegex = /^6((55|56|57|58|59|86|87|88|89)|9[0-9])\d{6}$/;
    // console.log('Test OM: ', orangeRegex.test(phone));
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
    // Check if string start with 650, 651, 652, 653, 654, 67* or 680*
    const mtnRegex = /^6((50|51|52|53|54)|7[0-9]|8[0-5])\d{6}$/;
    // console.log('Test MTN: ', mtnRegex.test(phone));
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
    this.bic = undefined;
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

    if (this.step <= 3) {
      this.step++;
      console.log("Passage à l'étape:", this.step);
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
      console.log("Retour à l'étape:", this.step);
    }
  }

  // Méthode pour réinitialiser le stepper
  stepperToProceed() {
    this.goToProceed = true;
    if (!this.verifytransactionData(this.transactionData)) return;
    this.scrollToTop();
    console.log('transactionData: ', this.transactionData);
  }

  resetStepper() {
    this.step = 1;
    console.log("Stepper réinitialisé à l'étape:", this.step);
  }
  // Méthode pour vérifier si on peut passer à l'étape suivante
  canProceedToNextStep(): boolean {
    switch (this.step) {
      case 1:
        return this.canNext();
      case 2:
        return this.canNext2();
      default:
        return true;
    }
  }

  fotmatForBr(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  /**
   * Cleans up data when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
