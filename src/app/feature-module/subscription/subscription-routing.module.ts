import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription/subscription.component';
import { PackagesComponent } from './packages/packages.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'subscription',
  },
  {
    path: 'subscription',
    component: SubscriptionComponent
  },
  {
    path: 'packages',
    component: PackagesComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'subscription',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
