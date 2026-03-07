import { Component, Input, OnInit } from '@angular/core';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-proceed-payment',
  templateUrl: './proceed-payment.component.html',
  styleUrls: ['./proceed-payment.component.scss'],
})
export class ProceedPaymentComponent implements OnInit{
  @Input() transactionData!: any;
  @Input() currentUser!: any;
  @Input() userData!: any;
  systemData: any;

  @Input() transactionType!: string;

  @Input() planData!: any;
  @Input() subscriptionData!: any;
  @Input() serviceData!: any;
  @Input() fundraisingData!: any;
  @Input() requestPaymentData!: any;
  @Input() transferData!: any;
  @Input() paymentLinkData!: any;

  taxesAmount: number = 0;
  price: number = 0;
  quantity: number = 1;
  amount: number = 0;
  
  futureDate: Date = new Date();
  private intervalId: any;
  goToProceed: boolean = false;
  
  constructor(
    private systemService: SystemService,
    private userService: UserService,
    private paymentService: PaymentService,
  ) {
    // this.getSystemData();
  }

  ngOnInit(): void {
    this.getSystemData();
  }

  getSystemData() {
    this.systemService.getSystemData().subscribe((res: any) => {
      console.log('system data: ', res);
      this.taxesAmount = (res.taxes / 100) * this.transactionData.amount;
      this.systemData = res;
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


  showName(userData) {
    return this.userService.showName(userData);
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
