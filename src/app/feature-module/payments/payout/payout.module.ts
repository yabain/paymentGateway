import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PayoutComponent } from './payout.component';
import { PageComponent } from './page/page.component';
import { AllPaymentsComponent } from './all-payments/all-payments.component';
import { PayoutRoutingModule } from './payout-routing.module';
import { CommonItemModule } from '../../common/common-item.module';
import { PayinComponent } from '../payin/payin.component';


@NgModule({
  declarations: [
    PageComponent,
    PayoutComponent,
    PayinComponent,
    AllPaymentsComponent,
  ],
  imports: [
    CommonModule,
    PayoutRoutingModule,
    SharedModule,
    TranslateModule,
    CommonItemModule
  ],
  providers: []
})
export class PayoutModule { }
