import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingRoutingModule } from './setting-routing.module';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SystemSettingsComponent } from './system-settings.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SystemSettingsComponent, SidemenuComponent],
  imports: [CommonModule, SettingRoutingModule, SharedModule,
    TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SystemSettingsModule {}
