import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatesComponent } from './states.component';

const routes: Routes = [{ path: '', component: StatesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatesRoutingModule { }
