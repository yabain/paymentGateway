import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendMoneyComponent } from './send-money.component';

const routes: Routes = [{ path: '**', component: SendMoneyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendMoneyRoutingModule { }
