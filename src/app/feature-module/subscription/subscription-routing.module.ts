import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription.component';
import { PackagesComponent } from './packages/packages.component';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionComponent,
    children: [
      {
        path: '',
        redirectTo: 'subscription',
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
