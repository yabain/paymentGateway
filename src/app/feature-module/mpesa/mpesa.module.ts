import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonItemModule } from '../common/common-item.module';
import { MpesaComponent } from './mpesa.component';
import { MpesaRoutingModule } from './mpesa-routing.module';
import { PageComponent } from './page/page.component';

@NgModule({
  declarations: [MpesaComponent, PageComponent],
  imports: [
    CommonModule,
    MpesaRoutingModule,
    SharedModule,
    TranslateModule,
    CommonItemModule,
  ],
})
export class MpesaModule {}
