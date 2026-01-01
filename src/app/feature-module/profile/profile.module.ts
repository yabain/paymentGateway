import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeadProfileComponent } from './head-profile/head-profile.component';

@NgModule({
  declarations: [
    ProfileComponent,
    HeadProfileComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule],
    exports: [ProfileComponent, HeadProfileComponent],
})
export class ProfileModule { }
