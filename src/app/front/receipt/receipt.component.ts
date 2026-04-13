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
  @Input() phone: boolean;
  @Input() email: boolean;
  

  constructor() { }

  ngOnInit(): void {
    console.log('Receipt Data:', this.receiptData);
  }

  get tx(): any {
    return this.receiptData?.transactionId || this.receiptData || null;
  }

  get receiptId(): string {
    return this.tx?._id || this.receiptData?._id || '';
  }

  getUrl(): string {
    console.log('invoice url: ', environment.frontUrl + '/invoice/' + this.receiptId)
    return environment.frontUrl + '/invoice/' + this.receiptId;
  }
}
