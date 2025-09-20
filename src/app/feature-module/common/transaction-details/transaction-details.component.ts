// json-viewer.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService } from 'src/app/services/user/user.service';
import { PaymentService } from 'src/app/services/payment/payment.service'
@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit {
  @Input() transactionData: any;
  customer: any;
  card: any;
  meta: any;
  currentUser: any;
  payinStatus: string;
  payoutStatus: string;

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
  ) {
    if(this.transactionData?.customer) this.customer = this.transactionData.customer;
    if(this.transactionData?.card) this.card = this.transactionData.card;
    if(this.transactionData?.meta) this.meta = this.transactionData.meta;
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.getPayinStatus();
    this.getPayoutStatus();
  }
  async getCurrentUser(){
    this.currentUser = await this.userService.getCurrentUser();
    console.log("currentUser", this.currentUser);
  }

  getPayinStatus(){
    this.payinStatus = this.paymentService.getPayinTransactionStatus(this.transactionData);
    console.log("payinStatus", this.payinStatus);
  }

  getPayoutStatus(){
    this.payoutStatus = this.paymentService.getPayoutTransactionStatus(this.transactionData);
    console.log("payoutStatus", this.payoutStatus)
  }
}
