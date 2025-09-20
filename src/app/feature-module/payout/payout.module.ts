import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PayoutComponent } from './payout.component';
import { PageComponent } from './page/page.component';
import { AllPayoutComponent } from './all-payout/all-payout.component';
import { PayoutRoutingModule } from './payout-routing.module';
import { JsonViewerComponent } from '../common/json-viewer/json-viewer.component';
import { TransactionDetailsComponent } from '../common/transaction-details/transaction-details.component';


@NgModule({
  declarations: [
    PageComponent,
    PayoutComponent,
    AllPayoutComponent,
    JsonViewerComponent,
    TransactionDetailsComponent
  ],
  imports: [
    CommonModule,
    PayoutRoutingModule,
    SharedModule,
    TranslateModule
  ],
  providers: []
})
export class PayoutModule { }
