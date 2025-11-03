import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  gettingTransactions: boolean = true;
  transactionList: any = [];
  selectedTransaction: any;
  page: number = 1;
  private pollTimer: any;
  currentUser: any;
  metadata: any;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getData();
    });
  }

  refresh() {
    this.transactionList = [];
    this.getData();
  }

  getData() {
    this.getTransactionList(this.page);
  }

  selectTransaction(transaction) {
    this.selectedTransaction = transaction;
  }

  previousPage() {
    if (this.page < 2) {
      this.page = 1;
      return false;
    }
    this.page -= 1;
    this.gettingTransactions = true;
    this.transactionList = [];
    this.scrollToTop();
    return this.getTransactionList(this.page);
  }

  nextPage() {
    if (this.transactionList.length < 10) {
      return false;
    }
    this.page += 1;
    this.gettingTransactions = true;
    this.transactionList = [];
    this.scrollToTop();
    return this.getTransactionList(this.page);
  }

  getTransactionList(page: number = 1) {
    this.gettingTransactions = true;
    this.startPolling(page);
  }

  async getUserData(): Promise<any> {
    this.currentUser = await this.userService.getCurrentUserData();
    return this.currentUser;
  }

  async startPolling(page: number = 1) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    await this.getUserData();
    this.pollTimer = setInterval(async () => {
      try {
        this.paymentService.getAllTransactionOfUser(this.currentUser._id, page).subscribe({
          next: (res: any) => {
            this.transactionList = res.data;
            console.log('transactionList: ', this.transactionList);
            this.metadata = res.pagination;
            this.gettingTransactions = false;
          },
          error: (err) => {
            this.gettingTransactions = false;
            console.log(err);
          },
        });
        // console.log('polling');
      } catch (err) {
        console.warn('polling error', err);
      }
    }, 15 * 1000);
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

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
