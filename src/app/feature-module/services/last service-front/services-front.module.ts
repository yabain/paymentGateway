import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesFrontRoutingModule } from './services-front-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesService } from 'src/app/services/services/services.service';
import { FrontModule } from 'src/app/front/front.module';
import { ServicesFrontComponent } from './services-front.component';
import { ServicesModule } from '../services.module';


@NgModule({
  declarations: [
    ServicesFrontComponent,
    
  ],
  imports: [
    CommonModule,
    ServicesFrontRoutingModule,
    SharedModule,
    TranslateModule,
    FrontModule,
    ServicesModule
  ],
  providers: [ServicesService]
})
export class ServicesFrontModule { }
