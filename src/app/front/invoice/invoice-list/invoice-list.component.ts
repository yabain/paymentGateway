import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-invoice-list',
  styleUrls: ['./invoice-list.component.scss'],
  templateUrl: './invoice-list.component.html'
})

export class InvoiceListComponent implements OnInit, OnDestroy {

  @Input() invoiceList: {
    plansId: any;
    dateStart: string;
    dateEnd: string;
    transactionId: string;
    createdAt: string
  }[] = [];
  frontUrl: string = environment.frontUrl;

  constructor(
  ){}

  ngOnInit(): void {
    console.log(this.invoiceList);
  }

  public getDate(date: string) {
    return date.split('T')[0];
  }

  ngOnDestroy(): void {
  }
}
