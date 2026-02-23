import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingRoutingModule } from './setting-routing.module';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SystemSettingsComponent } from './system-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { WhatsappSettingsComponent } from './whatsapp-settings/whatsapp-settings.component';
import { QRCodeModule } from 'angularx-qrcode';
import { CommonItemModule } from '../common/common-item.module';
import { EmailSettingsComponent } from './email-settings/email-settings.component';
import { InvoiceSettingsComponent } from './invoice-settings/invoice-settings.component';
import { PaymentSettingsComponent } from './payment-settings/payment-settings.component';

@NgModule({
  declarations: [
    SystemSettingsComponent,
    SidemenuComponent,
    WhatsappSettingsComponent,
    EmailSettingsComponent,
    InvoiceSettingsComponent,
    PaymentSettingsComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    SharedModule,
    TranslateModule,
    CommonItemModule,
    QRCodeModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SystemSettingsModule { }
