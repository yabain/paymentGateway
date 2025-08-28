import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubscriptionComponent } from './subscription.component';
import { PackagesComponent } from './packages/packages.component';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    SubscriptionComponent,
    SubscriptionListComponent,
    PackagesComponent
  ],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    SharedModule,
    TranslateModule
  ]
})
export class SubscriptionModule { }
