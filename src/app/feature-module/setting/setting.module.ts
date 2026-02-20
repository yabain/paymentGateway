import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from './setting.component';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SettingComponent, SidemenuComponent],
  imports: [CommonModule, SettingRoutingModule, SharedModule,
    TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingModule {}
