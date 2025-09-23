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
  status: string = 'transaction_initialized';

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
  ) {
    this.getCurrentUser();
    console.log("transactionData", this.transactionData);
  }

  ngOnInit(): void {
    this.getTransactionStatus();
  }

  async getCurrentUser(){
    this.currentUser = await this.userService.getCurrentUser();
    console.log("currentUser", this.currentUser);
  }

  getTransactionStatus(){
    // this.status = this.paymentService.getTransactionStatus(this.transactionData);
    // this.status = this.transactionData?.status;
    console.log("getTransactionStatus", this.status);
    if(this.transactionData?.customer) this.customer = this.transactionData.customer;
    if(this.transactionData?.card) this.card = this.transactionData.card;
    if(this.transactionData?.meta) this.meta = this.transactionData.meta;
    console.log("les meta: ", this.customer, this.card, this.meta);
  }

  acceptPayment(transactionId){
    this.paymentService.acceptPayment(transactionId)
    .subscribe((resp: any) => {
    })
  }

  rejectPayment(transactionId){}
}
