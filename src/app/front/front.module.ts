
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureModuleRoutingModule } from '../feature-module/feature-module-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PageComponent } from './page/page.component';
import { FooterComponent } from './footer/footer.component';
import { AddSubscriberComponent } from './add-subscriber/add-subscriber.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './calendar/calendar.component';
import { PortalComponent } from './portal/portal.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json?v=' + new Date().getTime());
}

@NgModule({
  declarations: [
    PackageDetailsComponent,
    PageComponent,
    FooterComponent,
    AddSubscriberComponent,
    CalendarComponent,
    PortalComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    FeatureModuleRoutingModule, 
    TranslateModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule
  ],
    exports: [
      PackageDetailsComponent,
      PageComponent,
      FooterComponent,
      CalendarComponent,
      FullCalendarModule],
})
export class FrontModule {}
