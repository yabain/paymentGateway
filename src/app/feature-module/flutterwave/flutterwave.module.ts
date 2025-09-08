import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlutterwaveComponent } from './flutterwave.component';
import { PageComponent } from './page/page.component';
import { FlutterwaveRoutingModule } from './flutterwave-routing.module';


@NgModule({
  declarations: [
    PageComponent,
    FlutterwaveComponent,
  ],
  imports: [
    CommonModule,
    FlutterwaveRoutingModule,
    SharedModule,
    TranslateModule
  ],
  providers: []
})
export class FlutterwaveModule { }
