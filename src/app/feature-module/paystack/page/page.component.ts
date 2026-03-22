import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PaystackService } from 'src/app/services/paystack/paystack.service';

@Component({
  selector: 'app-paystack-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private pollTimer: any;

  status = true;
  gettingSolde = true;
  gettingPayinTransactions = true;
  gettingPayoutTransactions = true;

  soldeListe: any[] = [];
  solde = 0;
  mainCurrency = 'KES';
  otherSolde: any[] = [];

  payinList: any[] = [];
  payoutList: any[] = [];
  periodePayin = '1';
  periodePayout = '1';
  payoutPage = 1;
  payinPage = 1;

  selectedPayinTransaction: any;
  selectedPayoutTransaction: any;

  constructor(private paystackService: PaystackService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(showLoader = true): void {
    this.getSolde(showLoader);
    this.getPayinList(Number(this.periodePayin), this.payinPage, showLoader);
    this.getPayoutList(Number(this.periodePayout), this.payoutPage, showLoader);
    this.startPolling();
  }

  getSolde(showLoader = true): void {
    if (showLoader) {
      this.gettingSolde = true;
    }
    this.paystackService
      .getBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.soldeListe = rows;
        const main = rows.find((r: any) => String(r?.currency).toUpperCase() === this.mainCurrency) || rows[0];
        this.solde = Number(main?.available_balance ?? main?.balance ?? 0);
        this.otherSolde = rows.filter(
          (r: any) =>
            String(r?.currency).toUpperCase() !== this.mainCurrency &&
            Number(r?.available_balance ?? r?.balance ?? 0) > 0,
        );
        if (showLoader) {
          this.gettingSolde = false;
        }
      });
  }

  getPayinList(periode = 1, page = 1, showLoader = true): void {
    if (showLoader) {
      this.gettingPayinTransactions = true;
    }
    const range = this.buildDateRange(periode);
    this.paystackService
      .getPayinList({ page, limit: 10, from: range.from, to: range.to })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.payinList = this.extractRows(res);
        if (showLoader) {
          this.gettingPayinTransactions = false;
        }
      });
  }

  getPayoutList(periode = 1, page = 1, showLoader = true): void {
    if (showLoader) {
      this.gettingPayoutTransactions = true;
    }
    const range = this.buildDateRange(periode);
    this.paystackService
      .getPayoutList({ page, limit: 10, from: range.from, to: range.to })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.payoutList = this.extractRows(res);
        if (showLoader) {
          this.gettingPayoutTransactions = false;
        }
      });
  }

  onSelectInPeriode(event: Event): void {
    this.periodePayin = (event.target as HTMLSelectElement).value;
    this.payinPage = 1;
    this.getPayinList(Number(this.periodePayin), this.payinPage);
  }

  onSelectOutPeriode(event: Event): void {
    this.periodePayout = (event.target as HTMLSelectElement).value;
    this.payoutPage = 1;
    this.getPayoutList(Number(this.periodePayout), this.payoutPage);
  }

  nextPayinPage(): void {
    if (this.payinList.length < 10) {
      return;
    }
    this.payinPage += 1;
    this.getPayinList(Number(this.periodePayin), this.payinPage);
  }

  previousPayinPage(): void {
    if (this.payinPage < 2) {
      return;
    }
    this.payinPage -= 1;
    this.getPayinList(Number(this.periodePayin), this.payinPage);
  }

  nextPayoutPage(): void {
    if (this.payoutList.length < 10) {
      return;
    }
    this.payoutPage += 1;
    this.getPayoutList(Number(this.periodePayout), this.payoutPage);
  }

  previousPayoutPage(): void {
    if (this.payoutPage < 2) {
      return;
    }
    this.payoutPage -= 1;
    this.getPayoutList(Number(this.periodePayout), this.payoutPage);
  }

  selectPayinTransaction(transaction: any): void {
    this.selectedPayinTransaction = transaction;
  }

  selectPayoutTransaction(transaction: any): void {
    this.selectedPayoutTransaction = transaction;
  }

  getStatusClass(tx: any): string {
    const status = String(tx?.status || '').toLowerCase();
    if (status.includes('success')) {
      return 'table-success';
    }
    if (status.includes('pending')) {
      return 'table-light';
    }
    if (status.includes('fail') || status.includes('error')) {
      return 'table-danger';
    }
    return '';
  }

  getTxName(tx: any): string {
    return (
      tx?.customer?.name ||
      tx?.customer_name ||
      tx?.full_name ||
      tx?.recipient?.name ||
      tx?.receiverName ||
      '-'
    );
  }

  getTxAmount(tx: any): number {
    return this.fromMinorUnit(tx?.amount ?? tx?.receiverAmount ?? tx?.estimation ?? 0);
  }

  getTxFee(tx: any): number {
    return this.fromMinorUnit(tx?.fees ?? tx?.app_fee ?? tx?.fee ?? tx?.taxesAmount ?? 0);
  }

  getTxCurrency(tx: any): string {
    return tx?.currency || tx?.receiverCurrency || tx?.senderCurrency || this.mainCurrency;
  }

  getTxDate(tx: any): string {
    return tx?.createdAt || tx?.created_at || tx?.paid_at || tx?.updatedAt || '';
  }

  getTxRef(tx: any): string {
    return tx?.reference || tx?.transactionRef || tx?.txRef || tx?.id || tx?._id || '-';
  }

  private buildDateRange(months: number): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    return {
      from: this.toDateOnly(from),
      to: this.toDateOnly(to),
    };
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private extractRows(res: any): any[] {
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  }

  private fromMinorUnit(value: any): number {
    const parsed = Number(value ?? 0);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return parsed * 0.01;
  }

  private startPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    this.pollTimer = setInterval(() => {
      this.getSolde(false);
      this.getPayinList(Number(this.periodePayin), this.payinPage, false);
      this.getPayoutList(Number(this.periodePayout), this.payoutPage, false);
    }, 10000);
  }

  private stopPolling(): void {
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
