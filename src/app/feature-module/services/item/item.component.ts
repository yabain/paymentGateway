import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { FlutterwaveService } from 'src/app/services/flutterwave/flutterwave.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { ServicesService } from 'src/app/services/services/services.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

interface data {
  value: string;
}
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit, OnDestroy {
  @Input() user: any = false;
  @Input() service: any;
  @Input() systemData: any;
  optionsData: any = [];
  picture: string = 'assets/img/resources/generic.jpeg';
  checkingSubscriptionStatus: boolean = true;
  isSubscriber: boolean = true;
  quantity: number = 1;
  estimation: number = 0;
  taxesAmount: number = 0;
  paymentWithTaxes: number = 0;
  private destroy$ = new Subject<void>();
  private pollTimer: any;
  proceed: boolean = false;
  goToProceed: boolean = false;
  redirect_url: string = '';
  showRetry: boolean = false;
  modalClosed: boolean = false;
  reOpen: boolean = false;
  transactionSucceeded: boolean = false;
  transactionFailed: boolean = false;
  servicesListStat: any;
  transactionData!: any;
  txRef: string;
  searchString: string = '';
  isElection: boolean = true;
  invoiceTaxes: number = 5;
  transactionRef: string;
  price: string = '0';
  submitted: boolean = false;
  form: FormGroup;
  url: string = '';

  constructor(
    private servicesService: ServicesService,
    private paymentService: PaymentService,
    private toastService: ToastService,
    private userService: UserService,
    private location: Location,
    private storage: StorageService,
    private router: Router,
    private fw: FlutterwaveService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    // console.log('service: ', this.service);
    this.getId();
    this.getSystemData();
    this.checkSubscriberStatus();
    this.idrateData();
    this.optionsData = this.service ? this.service.options : [];
    this.transactionRef = this.paymentService.generateId();
  }

  getId() {
    this.url = this.location.path();
  }


  checkSubscriberStatus() {
    this.checkingSubscriptionStatus = true;
    this.servicesService
      .checkSubscriberStatus(this.service._id)
      .then((data: any) => {
        if (data.existingSubscription && data.status) {
          this.isSubscriber = true;
        } else {
          this.isSubscriber = false;
        }
        this.checkingSubscriptionStatus = false;
      });
  }

  idrateData() {
    this.quantity = 1;
    this.optionsData = this.service ? this.service.options : [];
    this.estimation = this.service.price;
    this.taxesAmount = this.calculateTaxesAmount();
    this.paymentWithTaxes = this.paymentWithTaxesCalculation();
    // console.log('options: ', service)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.pollTimer);
    this.proceed = false;
    this.goToProceed = false;
    this.showRetry = false;
    this.reOpen = false;
    this.transactionSucceeded = false;
    this.transactionFailed = false;
    this.modalClosed = false;
    this.transactionData = null;
    this.txRef = '';
    this.redirect_url = '';
    this.optionsData = [];
    this.searchString = '';
    this.checkingSubscriptionStatus = true;
  }

  calculateTaxesAmount(): number {
    this.estimation = this.quantity * this.service.price;
    if (this.isElection) {
      if (this.quantity === 10) {
        this.estimation = 900;
      }
      if (this.quantity === 20) {
        this.estimation = 1800;
      }
      if (this.quantity === 100) {
        this.estimation = 9000;
      }
    }
    return this.aroundValue(this.estimation * (this.invoiceTaxes / 100));
  }

  pay() {
    if (!this.service) return;
    this.proceed = true;
    console.log('proceed: ', this.proceed);
    this.setTransactionData();
    console.log('transactionData: ', this.transactionData);
    setTimeout(() => {
      this.goToProceed = true;
      this.proceedPayToService();
    }, 2000);
  }

  setTransactionData() {
    this.transactionData = {
      transactionRef: this.transactionRef,
      estimation: this.estimation,
      invoiceTaxes: this.invoiceTaxes,
      taxesAmount: this.calculateTaxesAmount(),
      paymentWithTaxes: this.paymentWithTaxesCalculation(),

      senderId: this.user._id,
      senderName: this.showName(this.user),
      senderEmail: this.user.email,
      senderContact: this.user.phone,
      senderCountry: this.user.countryId.name,
      senderCurrency: this.service.currency,

      raisonForTransfer: this.paymentService.transactionType.SERVICE,
      userId: this.user._id,

      receiverName: this.showName(this.service.author),
      receiverEmail: this.service.author.email,
      receiverContact: this.service.author.phone,
      serviceId: this.service._id,
      receiverCurrency: this.service.currency,
      quantity: this.quantity,
      receiverAmount: this.getCleanAmount(),

      receiverId: this.service.author._id,

      status: this.paymentService.status.PAYINPENDING,
      transactionType: this.paymentService.transactionType.SERVICE,
    };
  }

  onQuantity() {
    this.quantity = this.arrondirParExces(this.quantity);
    this.taxesAmount = this.calculateTaxesAmount();
    this.paymentWithTaxes = this.paymentWithTaxesCalculation();
  }

  returnQuantity(serviceId: string) {
    const resp = this.servicesListStat.find(item => item.serviceId === serviceId);
    return resp ? resp.quantity : 0;
  }

  aroundValue(val) {
    return Math.ceil(val);
  }

  paymentWithTaxesCalculation() {
    return this.aroundValue(this.estimation + this.calculateTaxesAmount());
  }

  startPolling() {
    if (!this.txRef) return;
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.transactionSucceeded = false;
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

  handlePayinStatus(resp: any) {
    const status =
      resp?.data?.data?.status ||
      resp?.data?.status ||
      resp?.status ||
      'pending';
    console.log('resp: ', resp);
    console.log('status: ', status);
    if (['successful', 'success'].includes(status.toLowerCase())) {
      this.transactionSucceeded = true;
      this.transactionFailed = false;
      clearInterval(this.pollTimer);
    }
    if (['cancelled'].includes(status.toLowerCase())) {
      this.transactionSucceeded = false;
      this.transactionFailed = true;
      // clearInterval(this.pollTimer);
    }
    if (['failed'].includes(status.toLowerCase())) {
      this.transactionSucceeded = false;
      this.transactionFailed = true;
      // clearInterval(this.pollTimer);
    }
  }

  openPayin() {
    this.reOpen = true;
    this.transactionSucceeded = false;
    this.transactionFailed = false;
    this.paymentService.openPayin(this.txRef).subscribe((res: any) => {
      if (res && res.status === 'pending') {
        return this.handleRequest();
      }
      return this.toastService.presentToast('error', 'Error', '');
    });
  }

  verifytransactionData(transactionData): boolean {
    if (transactionData.payment < 100) {
      return false;
    }
    return true;
  }

  async proceedPayToService() {
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


  getSystemData() {
      this.invoiceTaxes = this.systemData ? this.systemData.invoiceTaxes : 0;
  }

  showName(userData) {
    return this.userService.showName(userData);
  }


  formatAmount(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');

    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    this.price = value;
    event.target.value = value;
  }

  getCleanAmount(): number {
    const cleanValue = this.price.replace(/\s/g, '');
    return parseFloat(cleanValue) || 0;
  }

  arrondirParExces(nombre) {
    if (!Number.isFinite(nombre)) throw new Error("Invalide");
    return Number.isInteger(nombre) ? nombre : Math.ceil(nombre);
  }

  isAuthor(service: any, user: any = this.user) {
    // console.log('service: ', service);
    if (service.author) return true;
    return user._id.toString() === service.author._id.toString() ? true : false;
  }

  navigateTo(route) {
    if (!this.user && route === '/auth/login') {
      this.storage.setStorage(environment.memory_link, this.url);
    }
    this.ngOnDestroy();
    this.router.navigate([route]);
  }
}
