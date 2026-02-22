import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailSettingsRoutingModule } from './email-settings-routing.module';
import { EmailSettingsComponent } from './email-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonItemModule } from '../../common/common-item.module';
import { QRCodeModule } from 'angularx-qrcode';


@NgModule({
  declarations: [
    EmailSettingsComponent
  ],
  imports: [
    CommonModule,
    EmailSettingsRoutingModule,
    SharedModule,
    TranslateModule,
    CommonItemModule,
    QRCodeModule
  ]
})
export class EmailSettingsModule { }
