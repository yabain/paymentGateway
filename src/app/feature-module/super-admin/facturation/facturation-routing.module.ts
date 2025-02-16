import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturationComponent } from './facturation.component';

const routes: Routes = [{ path: '', component: FacturationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturationRoutingModule { }
