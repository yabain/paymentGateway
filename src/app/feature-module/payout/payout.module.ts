import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PayoutComponent } from './payout.component';
import { PageComponent } from './page/page.component';
import { AllPayoutComponent } from './all-payout/all-payout.component';
import { PayoutRoutingModule } from './payout-routing.module';
import { CommonItemModule } from '../common/common-item.module';


@NgModule({
  declarations: [
    PageComponent,
    PayoutComponent,
    AllPayoutComponent,
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
