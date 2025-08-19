import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SendMoneyRoutingModule } from './send-money-routing.module';
import { SendMoneyComponent } from './send-money.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SendMoneyComponent],
  imports: [CommonModule, SendMoneyRoutingModule, SharedModule],
})
export class SendMoneyModule {}
