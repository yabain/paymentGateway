import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { FlutterwaveService } from 'src/app/services/flutterwave/flutterwave.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-proceed-payment',
  templateUrl: './proceed-payment.component.html',
  styleUrls: ['./proceed-payment.component.scss'],
})
export class ProceedPaymentComponent implements OnInit {
  @Input() transactionData!: any;
  @Input() currentUser!: any;
  @Input() userData!: any;
  systemData: any;

  @Input() transactionType!: string;

  @Input() planData!: any;
  @Input() subscriptionData!: any;
  @Input() isSubscriber: boolean = false;
  @Input() serviceData!: any;
  @Input() fundraisingData!: any;
  @Input() requestPaymentData!: any;
  @Input() transferData!: any;
  @Input() paymentLinkData!: any;

  optionsData: any;
  private destroy$ = new Subject<void>();
  taxesAmount: number = 0;
  price: number = 0;
  quantity: number = 1;
  amount: number = 0;

  futureDate: Date = new Date();
  private intervalId: any;
  goToProceed: boolean = false;
  proceed: boolean = false;
  txRef: string;
  transactionRef: string;
  estimation: number = 0;

  private pollTimer: any;
  invoiceTaxes: number = 5;

  redirect_url: string = '';
  showRetry: boolean = false;
  modalClosed: boolean = false;
  reOpen: boolean = false;
  transactionSucceded: boolean = false;
  transactionFailed: boolean = false;
  paymentWithTaxes: number = 0;

  gettingSystemData: boolean = true;

  constructor(
    private systemService: SystemService,
    private userService: UserService,
    private paymentService: PaymentService,
    private fw: FlutterwaveService,
    private storage: StorageService,
    private toastService: ToastService,
  ) {
    // this.getSystemData();
  }

  ngOnInit(): void {
    this.getSystemData();
    console.log('transactionType: ', this.transactionType);
    console.log('inputData plan: ', this.planData);
    console.log('isSubscriber: ', this.isSubscriber);
    if (this.transactionType === 'subscription') {
      this.optionsData = this.planData.options;
    }
    // console.log('isSubscriber: ', this.isSubscriber);
  }

  getSystemData() {
    this.systemService.getSystemData().subscribe((res: any) => {
      console.log('system data: ', res);
      if (res && res.appName) {
        this.systemData = res;
        this.invoiceTaxes = res.invoiceTaxes;
        this.taxesAmount = this.calculateTaxesAmount();
        this.paymentWithTaxes = this.paymentWithTaxesCalculation();
        this.gettingSystemData = false;
      }
    })
  }


  subscribe() {
    if (!this.planData) return;
    this.proceed = true;
    this.setTransactionData();
    setTimeout(() => {
      this.goToProceed = true;
      this.proceedSubscribe();
    }, 2000);
  }


  async proceedSubscribe() {
    if (!this.verifyTransactionData(this.transactionData)) return;
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


  verifyTransactionData(transactionData): boolean {
    if (transactionData.payment < 100 || transactionData.payment > 500000) {
      return false;
    }
    return true;
  }

  setTransactionData() {
    this.transactionData = {
      transactionRef: this.transactionRef,
      estimation: this.estimation,
      invoiceTaxes: this.invoiceTaxes,
      taxesAmount: this.planData.taxesAmount,
      paymentWithTaxes: this.paymentWithTaxesCalculation(),

      senderId: this.currentUser._id,
      senderName: this.showName(this.currentUser),
      senderEmail: this.currentUser.email,
      senderContact: this.currentUser.phone,
      senderCountry: this.currentUser.countryId.name,
      senderCurrency: this.planData.currency,

      raisonForTransfer: this.paymentService.transactionType.SUBSCRIPTION,
      userId: this.currentUser._id,

      receiverName: this.showName(this.planData.author),
      receiverEmail: this.planData.author.email,
      receiverContact: this.planData.author.phone,
      cycle: this.planData.cycle,
      planId: this.planData._id,
      receiverCurrency: this.planData.currency,
      quantity: this.quantity,
      receiverAmount: this.planData.price,

      receiverId: this.planData.author._id,

      status: this.paymentService.status.PAYINPENDING,
      transactionType: this.paymentService.transactionType.SUBSCRIPTION,
    };
  }


  paymentWithTaxesCalculation() {
    return this.aroundValue(this.estimation + this.calculateTaxesAmount());
  }

  aroundValue(val) {
    return Math.ceil(val);
  }

  showName(userData) {
    return this.userService.showName(userData);
  }

  showContinue(): boolean {
    return this.paymentWithTaxes > 10;
  }

  calculateTaxesAmount(): number {
    this.estimation = this.quantity * this.planData.price;
    return this.aroundValue(this.estimation * (this.invoiceTaxes / 100));
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


  startPolling() {
    if (!this.txRef) return;
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.transactionSucceded = false;
    this.transactionFailed = false;

    this.pollTimer = setInterval(async () => {
      try {
        this.paymentService
          .getPayinByTxRef(this.txRef)
          .subscribe((resp: any) => {
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
    if (['successful', 'success'].includes(status.toLowerCase())) {
      this.transactionSucceded = true;
      this.transactionFailed = false;
      clearInterval(this.pollTimer);
    }
    if (['cancelled'].includes(status.toLowerCase())) {
      this.transactionSucceded = false;
      this.transactionFailed = true;
      // clearInterval(this.pollTimer);
    }
    if (['failed'].includes(status.toLowerCase())) {
      this.transactionSucceded = false;
      this.transactionFailed = true;
      // clearInterval(this.pollTimer);
    }
  }


  onQuantity(event) {
    this.quantity = Number((event.target as HTMLSelectElement).value);
    this.taxesAmount = this.calculateTaxesAmount();
    this.paymentWithTaxes = this.paymentWithTaxesCalculation();
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
          this.paymentService
            .getPayinByTxRef(this.txRef)
            .subscribe((resp: any) => {
              this.handlePayinStatus(resp);
            });
          try {
            this.modalClosed = true;
            // this.verifyAndClosePayin();
          } catch { }
          // TODO: display a "payment canceled" message or refresh the status
        }
      }, 600);
    } else {
      this.toastService.presentToast('error', 'Error', '');
    }
  }

  isPaystackCurrency(currency?: string): boolean {
    const normalized = (currency || '').toUpperCase();
    return normalized === 'KES';
  }

  getTransactionCurrency(): string {
    return (
      this.transactionData?.receiverCurrency ||
      this.planData?.currency ||
      this.serviceData?.currency ||
      this.fundraisingData?.currency ||
      this.requestPaymentData?.currency ||
      this.transferData?.receiverCurrency ||
      this.currentUser?.countryId?.currency ||
      ''
    );
  }

  getPaymentProviderName(currency?: string): string {
    return this.isPaystackCurrency(currency) ? 'Paystack' : 'Flutterwave';
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.pollTimer);
    this.proceed = false;
    this.goToProceed = false;
    this.showRetry = false;
    this.reOpen = false;
    this.transactionSucceded = false;
    this.transactionFailed = false;
    this.modalClosed = false;
    // this.transactionData = null;
    // this.txRef = '';
    // this.redirect_url = '';
    // this.planData = null;
    // this.optionsData = [];
    // this.checkingSubscriptionStatus = true;
  }
}
