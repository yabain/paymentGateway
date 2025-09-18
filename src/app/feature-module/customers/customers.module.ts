import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers.component';
import { CustomersRoutingModule } from './customers-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerListComponent } from './customers-list/customer-list.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CustomersComponent,
    CustomerListComponent,
    CustomerDetailsComponent,
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class CustomersModule {}
