import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FundraisingComponent } from './fundraising.component';
import { FundraisingListComponent } from './fundraising-list/fundraising-list.component';
import { FundraisingDetailsComponent } from './fundraising-details/fundraising-details.component';

const routes: Routes = [
  {
    path: '',
    component: FundraisingComponent,
    children: [
      {
        path: '',
        component: FundraisingListComponent,
      },
      {
        path: 'my/list',
        component: FundraisingListComponent,
      },
      {
        path: 'my/active',
        component: FundraisingListComponent,
      },
      {
        path: 'list',
        component: FundraisingListComponent,
      },
      {
        path: 'user/:userId/list',
        component: FundraisingListComponent,
      },
      {
        path: 'user/:userId/active',
        component: FundraisingListComponent,
      },
      {
        path: 'user/:userId/active-public',
        component: FundraisingListComponent,
      },
      {
        path: 'donations/:donationId',
        component: FundraisingDetailsComponent,
      },
      {
        path: ':id',
        component: FundraisingDetailsComponent,
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FundraisingRoutingModule {}
