import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubscriptionComponent } from './subscription.component';
import { PackagesComponent } from './packages/packages.component';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { ItemComponent } from './packages/item/item.component';


@NgModule({
  declarations: [
    SubscriptionComponent,
    SubscriptionListComponent,
    PackagesComponent,
    ItemComponent,
  ],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    SharedModule,
    TranslateModule
  ],
  providers: [SubscriptionService]
})
export class SubscriptionModule { }
