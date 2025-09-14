import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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

  constructor(
    private paymentService: PaymentService,

    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.refresh();
    });
  }

  selectSection(section: string){
    this.page = 1;
    this.sectionSelected = section;
    this.getData()
  }

  getStat() {
    this.gettingStatistics = true;
      this.paymentService.getStatistics().subscribe((data: any) => {
        this.statistics = data;
        console.log('stat: ', data)
        this.gettingStatistics = false;
      });
  }

  selectTransaction(transaction){
    this.selectedTransaction = transaction;
  }

  getTransaction(){

  }

  refresh() {
    this.getData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextPage(){
    if(this.transactionList.length < 10){
      return false;
    }
    this.page +=1;
    return this.getTransactionList(this.page);
  }

  previousPage(){
    if(this.page < 2){
      this.page = 1;
      return false;
    }
    this.page -=1;
    return this.getTransactionList(this.page);
  }

  getTransactionList(page: number = 1) {
    this.transactionList = [];
    this.gettingTransactions = true;
    this.paymentService.getTransactionList(page).subscribe({
      next: (res: any) => {
        console.log('res: ', res);
        this.transactionList = res;
        this.gettingTransactions = false;
      },
      error: (err) => {
        this.gettingTransactions = false;
        console.log(err);
      },
    });
  }

  getTransactionListByStatus(transactionStatus: string, page: number = 1) {
    this.transactionList = [];
    this.gettingTransactions = true;
    this.paymentService.getTransactionListByStatus(transactionStatus, page).subscribe({
      next: (res: any) => {
        console.log('res: ', res);
        this.transactionList = res;
        this.gettingTransactions = false;
      },
      error: (err) => {
        this.gettingTransactions = false;
        console.log(err);
      },
    });
  }

  acceptPayment(transactionId){
    this.paymentService.acceptPayment(transactionId)
    .subscribe((resp: any) => {
      console.log('resp to accept:', resp);
      this.refresh();
    })
  }

  getData() {
    this.getStat();
    if(this.sectionSelected === 'all') return this.getTransactionList();
    else return this.getTransactionListByStatus(this.sectionSelected);
  }

  acceptAll(){}

  rejectAll(){}


}
