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

export enum ReqStatus {
  PENDING = 'financial_transaction_pending',
  ERROR = 'financial_transaction_error',
  SUCCESS = 'financial_transaction_success',
}

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
  invoiceRef: any;
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

  statusErrorMsg: any = [];
  methodName: string = 'Bank transfer';
  bankAccountNumber: string = '';
  bic: string = '';
  canNext2Val: boolean = false;

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

          // Vérifier si idParam existe avant de filtrer
          if (this.idParam) {
            selectedCountry = this.availableCountries.filter(
              (e) => e._id === this.idParam,
            );
            selectedCountry = selectedCountry[0];
          }

          // Si aucun pays n'est sélectionné, utiliser le pays par défaut de l'utilisateur
          if (
            !selectedCountry &&
            this.currentUser &&
            this.currentUser.countryId
          ) {
            selectedCountry = this.availableCountries.find(
              (e) => e._id === this.currentUser.countryId._id,
            );
          }

          this.setSelectedCountry(selectedCountry);
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
  //   console.log(this.newPayment + this.taxesValueCalculation());

  //   return this.aroundValue(this.newPayment + this.taxesValueCalculation());
  // }

  toggleDescription() {
    this.showDescription = !this.showDescription;
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
    this.receiverName = this.receiverFirstName + ' ' + this.receiverLastName;
    // return true;
    if (
      this.estimation < 1000 ||
      this.watingEstimation ||
      this.waitingUserData ||
      this.waitingExchangeRate
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
    console.log('canNext2: ');
    console.log('step: ', this.step);
    console.log('canNextVal: ', this.canNext2Val);
    this.setTransactionData();
    if (this.step === 2) {
      console.log('step2: ');
      if (this.selectedMethod === 'OM' || this.selectedMethod === 'MTN') {
        if (this.selectedCountry.currency === 'XAF') {
          return (this.canNext2Val = this.isValidPhoneNumber(
            this.transactionData.receiverMobileAccountNumber,
          ));
        } else if (this.receiverMobileAccountNumber) {
          return (this.canNext2Val = true);
        } else return (this.canNext2Val = false)
      } else {
        console.log('Else Bank ');
        if (
          this.transactionData?.bic &&
          this.transactionData?.bankAccountNumber
        ) {
          return (this.canNext2Val = true);
        } else {
          console.log('esle bankaccount: ');
          return (this.canNext2Val = false);
        }
      }
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
    // Checks that at least one ticket has been selected
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
    console.log('idParam00: ', idParam);
    console.log('currentUser countryId: ', this.currentUser.countryId._id);

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

    console.log('idParam final: ', this.idParam);
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
          this.handleRequest(res.transactionData);
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

      raisonForTransfer: this.raisonForTransfer,

      receiverName: this.receiverName,
      receiverEmail: this.receiverEmail,
      receiverContact: this.receiverContact,
      receiverAddress: this.receiverAddress,
      receiverCountry: this.selectedCountry.name,
      receiverCurrency: this.selectedCountry.currency,

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
    const orangeRegex = /^6((55|56|57|58|59)|9[0-9])\d{6}$/;
    // console.log('Test OM: ', orangeRegex.test(phone));
    return orangeRegex.test(phone);
  }

  // Phone number verification: MTN Cameroon
  isValidMTNPhoneNumber(phone: string): boolean {
    // Check if string start with 650, 651, 652, 653, 654, 67* or 680*
    const mtnRegex = /^6((50|51|52|53|54)|7[0-9]|8[0-9])\d{6}$/;
    // console.log('Test MTN: ', mtnRegex.test(phone));
    return mtnRegex.test(phone);
  }

  /**
   * Manage transaction response.
   */
  private handleRequest(transactionData) {
    if (transactionData.reqStatus === ReqStatus.PENDING) {
      this.router.navigate(['/tabs/proceed-transfer/' + transactionData._id]);
    } else if (transactionData.reqStatus === ReqStatus.ERROR) {
      this.toastService.presentToast(
        transactionData.message,
        'top',
        'danger',
        10000,
      );
    } else {
      this.toastService.presentToast('Error', 'top', 'danger');
    }
    this.proceed = false;
  }

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
  resetStepper() {
    this.step = 1;
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    console.log("Stepper réinitialisé à l'étape:", this.step);
  }

  // Méthode pour vérifier si on peut passer à l'étape suivante
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

    this.convertCurrency();
  }

  /**
   * Cleans up data when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
