import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturationRoutingModule } from './facturation-routing.module';
import { FacturationComponent } from './facturation.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DataTablesModule } from '../../ui-interface/tables/data-tables/data-tables.module';


@NgModule({
  declarations: [
    FacturationComponent
  ],
  imports: [
    CommonModule,
    FacturationRoutingModule,
    SharedModule,
    DataTablesModule
  ]
})
export class FacturationModule { }
