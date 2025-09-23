import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlutterwaveComponent } from './flutterwave.component';
import { PageComponent } from './page/page.component';
import { FlutterwaveRoutingModule } from './flutterwave-routing.module';
import { CommonItemModule } from '../common/common-item.module';


@NgModule({
  declarations: [
    PageComponent,
    FlutterwaveComponent,
  ],
  imports: [
    CommonModule,
    FlutterwaveRoutingModule,
    SharedModule,
    TranslateModule,
    CommonItemModule
  ],
  providers: []
})
export class FlutterwaveModule { }
