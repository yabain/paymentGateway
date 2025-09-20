import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlutterwaveComponent } from './flutterwave.component';
import { PageComponent } from './page/page.component';
import { FlutterwaveRoutingModule } from './flutterwave-routing.module';
import { JsonViewerComponent } from '../common/json-viewer/json-viewer.component';


@NgModule({
  declarations: [
    PageComponent,
    FlutterwaveComponent,
    JsonViewerComponent,
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
