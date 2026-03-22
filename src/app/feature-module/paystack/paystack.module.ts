import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonItemModule } from '../common/common-item.module';
import { PaystackComponent } from './paystack.component';
import { PaystackRoutingModule } from './paystack-routing.module';
import { PageComponent } from './page/page.component';

@NgModule({
  declarations: [PaystackComponent, PageComponent],
  imports: [
    CommonModule,
    PaystackRoutingModule,
    SharedModule,
    TranslateModule,
    CommonItemModule,
  ],
})
export class PaystackModule {}
