import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MakePaymentRoutingModule } from './make-payment-routing.module';
import { MakePaymentComponent } from './make-payment.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [MakePaymentComponent],
  imports: [CommonModule, MakePaymentRoutingModule, SharedModule],
})
export class MakePaymentModule {}
