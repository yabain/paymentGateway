// json-viewer.component.ts
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService } from 'src/app/services/user/user.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Subject } from 'rxjs/internal/Subject';
@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit, OnDestroy {
  @Input() transactionData: any;
  customer: any;
  card: any;
  meta: any;
  currentUser: any;
  status: string = 'transaction_initialized';
  processing: boolean = false;
  private destroy$ = new Subject<void>();
  private pollTimer: any;

  @ViewChild('closeModal') closeModal: ElementRef;

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
    private toastService: ToastService,
  ) {
    this.getCurrentUser();
    console.log('transactionData', this.transactionData);
    this.getTransactionStatus();
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
      this.startPolling(transactionId);
    });
  }

  rejectPayment(transactionId) {}

  retryPayment(transactionId) {}

  downloadInvoice() {}

  ngAfterViewInit() {
    if (this.closeModal) {
      this.closeModal.nativeElement.click();
    }
  }

  closeModalClick() {
    if (this.closeModal) {
      this.closeModal.nativeElement.click();
    }
  }

  checkStatus(transactionId) {
    console.log('checkStatus: ', transactionId)
    this.processing = true;
    this.paymentService
      .getTransactionData(transactionId)
      .subscribe((res: any) => {
        if (res.status === this.paymentService.status.PAYOUTPENDING) {
          console.log('pending');
        } else if (res.status === this.paymentService.status.PAYOUTSUCCESS) {
          this.toastService.presentToast('success', 'Done !', '');
            this.closeModalClick();
            this.processing = false;
            this.scrollToTop();
        } else if (res.status === this.paymentService.status.PAYOUTERROR) {
          this.toastService.presentToast('error', 'Error to Payout !', '');
            this.closeModalClick();
            this.processing = false;
            this.scrollToTop();
        } else {
          this.processing = true;
        }
      });
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }
  
  startPolling(transactionId: string) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      try {
        this.checkStatus(transactionId);
      } catch (err) {
        console.warn('polling error to get status', err);
      }
    }, 7000);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.pollTimer);
  }
}
