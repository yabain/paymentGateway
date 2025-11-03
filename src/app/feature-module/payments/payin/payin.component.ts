import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { PaymentService } from 'src/app/services/payment/payment.service';

@Component({
  selector: 'app-payin',
  templateUrl: './payin.component.html',
  styleUrls: ['./payin.component.scss'],
})
export class PayinComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  gettingTransactions: boolean = true;
  page: number = 1;
  transactionList: any[] = [];
  private pollTimer: any;
  selectedTransaction: any;
  statistics: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getData();
    });
  }

  getData() {
    this.getPayinTransactionList(this.page);
    this.getStat();
  }

  refresh() {
    this.transactionList = [];
    this.getData();
  }

  selectTransaction(transaction) {
    this.selectedTransaction = transaction;
  }

  nextPage() {
    if (this.transactionList.length < 10) {
      return false;
    }
    this.page += 1;
    this.gettingTransactions = true;
    this.transactionList = [];
    this.scrollToTop();
    return this.getPayinTransactionList(this.page);
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
    return this.getPayinTransactionList(this.page);
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

  getPayinTransactionList(page: number = 1) {
    this.gettingTransactions = true;
    this.startPolling(page);
  }

  getStat() {
    this.paymentService.getStatistics().subscribe((data: any) => {
      this.statistics = data;
    });
  }

  startPolling(page: number = 1) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      try {
          this.paymentService.getPayinTransactionList(page).subscribe({
            next: (res: any) => {
              this.transactionList = res;
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
    }, 7000);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling();
  }
}
