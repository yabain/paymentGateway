import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentRequestCreateComponent } from './payment-request-create/payment-request-create.component';
import { PaymentRequestListComponent } from './payment-request-list/payment-request-list.component';
import { PaymentRequestRoutingModule } from './payment-request-routing.module';

@NgModule({
  declarations: [PaymentRequestListComponent, PaymentRequestCreateComponent],
  imports: [CommonModule, SharedModule, TranslateModule, PaymentRequestRoutingModule],
})
export class PaymentRequestModule {}

