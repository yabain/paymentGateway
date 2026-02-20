import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanySettingsRoutingModule } from './company-settings-routing.module';
import { CompanySettingsComponent } from './company-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    CompanySettingsComponent
  ],
  imports: [
    CommonModule,
    CompanySettingsRoutingModule,
    SharedModule,
    TranslateModule,
  ]
})
export class CompanySettingsModule { }
