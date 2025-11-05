import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesService } from 'src/app/services/services/services.service';
import { ItemComponent } from './item/item.component';
import { FrontModule } from 'src/app/front/front.module';
import { DetailsComponent } from './details/details.component';
import { ServicesComponent } from './services.component';
import { CandidateComponent } from './candidate/candidate.component';


@NgModule({
  declarations: [
    ServicesComponent,
    ItemComponent,
    DetailsComponent,
    CandidateComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    SharedModule,
    TranslateModule,
    FrontModule
  ],
  exports: [
    ServicesComponent
  ],
  providers: [ServicesService]
})
export class ServicesModule { }
