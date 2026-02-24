import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription.component';
import { PackagesComponent } from './packages/packages.component';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { DetailsComponent } from './packages/details/details.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { MySubscriptionComponent } from './my-subscription-list/my-subscription.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionComponent,
    children: [
      {
        path: '',
        redirectTo: 'packages',
        pathMatch: 'full',
      },
      {
        path: 'subscription',
        component: SubscriptionListComponent,
      },
      {
        path: 'packages',
        component: PackagesComponent,
      },
    ],
  },
  {
    path: 'my-subscriptions',
    component: MySubscriptionComponent,
  },
  {
    path: 'subscription-details/:id',
    component: SubscriptionDetailsComponent,
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'packages',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionRoutingModule {}
