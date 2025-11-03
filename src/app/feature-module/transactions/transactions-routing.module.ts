import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionsComponent } from './transactions.component';

const routes: Routes = [
  { path: '',
    component: TransactionsComponent 
  },
  {
    path: 'transaction-details/:id',
    component: TransactionsComponent
  },
  {
    path: 'transaction-details',
    component: TransactionsComponent
  },
  {
    path: 'my-transactions/:id',
    component: TransactionsComponent
  },
  {
    path: 'my-transactions',
    component: TransactionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionsRoutingModule { }
