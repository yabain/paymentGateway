import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { DevComponent } from './dev/dev.component';

@NgModule({
  declarations: [
    SettingsComponent,
    DevComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule],
    exports: [SettingsComponent],
})
export class SettingsModule { }
