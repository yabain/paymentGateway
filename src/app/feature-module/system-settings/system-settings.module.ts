import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingRoutingModule } from './setting-routing.module';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SystemSettingsComponent } from './system-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { WhatsappSettingsComponent } from './whatsapp-settings/whatsapp-settings.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [SystemSettingsComponent, SidemenuComponent, WhatsappSettingsComponent],
  imports: [
    CommonModule,
    SettingRoutingModule,
    SharedModule,
    TranslateModule,
    QRCodeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SystemSettingsModule { }
