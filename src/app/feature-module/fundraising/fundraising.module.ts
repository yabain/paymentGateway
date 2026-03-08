import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { FundraisingRoutingModule } from './fundraising-routing.module';
import { FundraisingComponent } from './fundraising.component';
import { FundraisingListComponent } from './fundraising-list/fundraising-list.component';
import { FundraisingDetailsComponent } from './fundraising-details/fundraising-details.component';
import { FundraisingService } from 'src/app/services/fundraising/fundraising.service';
import { FrontModule } from 'src/app/front/front.module';

@NgModule({
  declarations: [
    FundraisingComponent,
    FundraisingListComponent,
    FundraisingDetailsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    FundraisingRoutingModule,
    FrontModule
  ],
  providers: [FundraisingService],
})
export class FundraisingModule {}
