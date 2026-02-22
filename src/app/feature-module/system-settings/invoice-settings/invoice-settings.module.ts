import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceSettingsRoutingModule } from './invoice-settings-routing.module';
import { InvoiceSettingsComponent } from './invoice-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    InvoiceSettingsComponent
  ],
  imports: [
    CommonModule,
    InvoiceSettingsRoutingModule,
    SharedModule,
    TranslateModule,
  ]
})
export class InvoiceSettingsModule { }
