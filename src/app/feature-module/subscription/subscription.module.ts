import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubscriptionComponent } from './subscription/subscription.component';
import { PackagesComponent } from './packages/packages.component';


@NgModule({
  declarations: [
    SubscriptionComponent,
    PackagesComponent
  ],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    SharedModule
  ]
})
export class SubscriptionModule { }
