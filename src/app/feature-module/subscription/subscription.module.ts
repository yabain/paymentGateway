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
import { FrontModule } from 'src/app/front/front.module';
import { DetailsComponent } from './packages/details/details.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { ProfileModule } from '../profile/profile.module';

@NgModule({
  declarations: [
    SubscriptionComponent,
    SubscriptionListComponent,
    PackagesComponent,
    ItemComponent,
    DetailsComponent,
    SubscriptionDetailsComponent
  ],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    SharedModule,
    TranslateModule,
    FrontModule,
    ProfileModule
  ],
  providers: [SubscriptionService],
})
export class SubscriptionModule { }
