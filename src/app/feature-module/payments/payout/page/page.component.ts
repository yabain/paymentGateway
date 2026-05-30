import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { FlutterwaveService } from 'src/app/services/flutterwave/flutterwave.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  gettingStatistics: boolean = false;
  statistics!: any;
  page: number = 1;
  sectionSelected: string = 'pending';
  gettingTransactions: boolean = true;
  transactionList: any[] = [];
  selectedTransaction: any;
  private pollTimer: any;
  processingBulkAction = false;

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.scrollToTop();
      this.refresh();
    });
  }

  selectSection(section: string) {
    this.page = 1;
    this.sectionSelected = section;
    this.gettingStatistics = true;
    this.transactionList = [];
    this.getData();
  }

  getStat(refresh: boolean = true) {
    if(refresh) this.gettingStatistics = true;
    this.paymentService.getStatistics().subscribe((data: any) => {
      this.statistics = data;
      this.gettingStatistics = false;
    });
  }

  selectTransaction(transaction) {
    this.selectedTransaction = transaction;
    console.log('selectedTransaction: ', this.selectedTransaction);
  }

  getTransaction() {}

  refresh() {
    this.gettingTransactions = true;
    this.transactionList = [];
    this.getData();
  }

  nextPage() {
    if (this.transactionList.length < 10) {
      return false;
    }
    this.page += 1;
    this.gettingTransactions = true;
    this.transactionList = [];
    this.scrollToTop();
    if (this.sectionSelected !== 'all')
      return this.getTransactionListByStatus(this.sectionSelected, this.page);
    return this.getPayoutTransactionList(this.page);
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
    if (this.sectionSelected !== 'all')
      return this.getTransactionListByStatus(this.sectionSelected, this.page);
    return this.getPayoutTransactionList(this.page);
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

  getPayoutTransactionList(page: number = 1) {
    this.gettingTransactions = true;
    this.startPolling(false, page);
  }

  getTransactionListByStatus(transactionStatus: string, page: number = 1) {
    this.gettingTransactions = true;
    this.startPolling(true, page, transactionStatus);
  }

  acceptPayment(transactionId) {
    if (!transactionId || this.processingBulkAction) return;
    this.paymentService.acceptPayment(transactionId).subscribe((resp: any) => {
      console.log('resp to accept:', resp);
      this.refresh();
    });
  }

  rejectPayment(transactionId) {
    if (!transactionId || this.processingBulkAction) return;
    this.paymentService.rejectPayment(transactionId).subscribe((resp: any) => {
      console.log('resp to reject:', resp);
      this.refresh();
    });
  }

  getData() {
    this.getStat();
    if (this.sectionSelected === 'all') return this.getPayoutTransactionList();
    else return this.getTransactionListByStatus(this.sectionSelected);
  }

  acceptAll() {
    const pendingTransactions = this.getAdminValidationPendingTransactions();
    if (!pendingTransactions.length || this.processingBulkAction) return;

    this.processingBulkAction = true;
    if (this.pollTimer) clearInterval(this.pollTimer);

    forkJoin(
      pendingTransactions.map((transaction) =>
        this.paymentService.acceptPayment(transaction._id),
      ),
    ).subscribe({
      next: () => {
        this.processingBulkAction = false;
        this.refresh();
      },
      error: (error) => {
        console.error('acceptAll error:', error);
        this.processingBulkAction = false;
        this.refresh();
      },
    });
  }

  rejectAll() {
    const pendingTransactions = this.getAdminValidationPendingTransactions();
    if (!pendingTransactions.length || this.processingBulkAction) return;

    this.processingBulkAction = true;
    if (this.pollTimer) clearInterval(this.pollTimer);

    forkJoin(
      pendingTransactions.map((transaction) =>
        this.paymentService.rejectPayment(transaction._id),
      ),
    ).subscribe({
      next: () => {
        this.processingBulkAction = false;
        this.refresh();
      },
      error: (error) => {
        console.error('rejectAll error:', error);
        this.processingBulkAction = false;
        this.refresh();
      },
    });
  }

  private getAdminValidationPendingTransactions(): any[] {
    return (this.transactionList || []).filter(
      (transaction) => transaction?.status === this.paymentService.status.PAYINSUCCESS,
    );
  }

  startPolling(byStatus = false, page: number = 1, transactionStatus?: string) {
    console.log('start polling: ', transactionStatus);
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      try {
        this.getStat(false);
        if (byStatus) {
          this.paymentService
            .getTransactionListByStatus(transactionStatus, page)
            .subscribe({
              next: (res: any) => {
                this.transactionList = res;
                this.gettingTransactions = false;
              },
              error: (err) => {
                this.gettingTransactions = false;
                console.log(err);
              },
            });
        } else {
          this.paymentService.getPayoutTransactionList(page).subscribe({
            next: (res: any) => {
              this.transactionList = res;
              this.gettingTransactions = false;
            },
            error: (err) => {
              this.gettingTransactions = false;
              console.log(err);
            },
          });
        }
        // console.log('polling');
      } catch (err) {
        console.warn('polling error', err);
      }
    }, 7000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.pollTimer);
  }
}
