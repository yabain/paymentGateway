// receipt.component.ts
import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})

export class ReceiptComponent {
  @Input() receiptData: any;
  @Input() name: string = 'digiKUNTZ Payments';
  

  constructor() { }

  ngOnInit(): void {
    console.log('Receipt Data:', this.receiptData);
  }


  getUrl(): string {
    return environment.frontUrl + '/invoice/' + this.receiptData.transactionId._id;
  }
}
