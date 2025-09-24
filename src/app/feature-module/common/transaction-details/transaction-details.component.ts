// json-viewer.component.ts
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService } from 'src/app/services/user/user.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { ToastService } from 'src/app/services/toast/toast.service';
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
  processing: boolean = false;

  @ViewChild('closeModal') closeModal: HTMLButtonElement;

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
    private toastService: ToastService,
  ) {
    this.getCurrentUser();
    console.log('transactionData', this.transactionData);
  }

  ngOnInit(): void {
    this.getTransactionStatus();
  }

  async getCurrentUser() {
    this.currentUser = await this.userService.getCurrentUser();
    console.log('currentUser', this.currentUser);
  }

  getTransactionStatus() {
    // this.status = this.paymentService.getTransactionStatus(this.transactionData);
    // this.status = this.transactionData?.status;
    console.log('getTransactionStatus', this.status);
    if (this.transactionData?.customer)
      this.customer = this.transactionData.customer;
    if (this.transactionData?.card) this.card = this.transactionData.card;
    if (this.transactionData?.meta) this.meta = this.transactionData.meta;
    console.log('les meta: ', this.customer, this.card, this.meta);
  }

  acceptPayment(transactionId) {
    this.processing = true;
    this.paymentService.acceptPayment(transactionId).subscribe((resp: any) => {
      this.processing = false;
      this.checkeStatus(transactionId);
    });
  }

  rejectPayment(transactionId) {}

  retryPayment(transactionId) {}

  downloadInvoice() {}

  ngAfterViewInit() {
    if (this.closeModal) {
      this.closeModal.click(); // Simule le clic
    }
  }

  closeModalClick() {
    if (this.closeModal) {
      this.closeModal.click();
    }
  }

  checkeStatus(transactionId) {
    this.processing = true;
    this.paymentService
      .getTransactionData(transactionId)
      .subscribe((res: any) => {
        if (res.status === this.paymentService.status.PAYOUTPENDING) {
          setTimeout(() => {
            this.checkeStatus(transactionId);
          }, 5 * 1000);
        } else if (res.status === this.paymentService.status.PAYOUTSUCCESS) {
          this.toastService.presentToast('success', 'Done !', '');
          setTimeout(() => {
            window.location.reload();
            this.processing = false;
            this.closeModalClick();
          }, 3 * 1000);
        } else if (res.status === this.paymentService.status.PAYOUTERROR) {
          this.toastService.presentToast('error', 'Done !', '');
          setTimeout(() => {
            window.location.reload();
            this.processing = false;
            this.closeModalClick();
          }, 3 * 1000);
        } else {
          this.processing = false;
          this.getTransactionStatus();
        }
      });
  }
}
