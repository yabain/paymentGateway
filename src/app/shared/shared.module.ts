import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { NgxBootstrapModule } from './ngx-bootstrap/ngx-bootstrap.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PaginationModule } from '../feature-module/common/pagination/pagination.module';
import { NgxMaskModule,IConfig, NGX_MASK_CONFIG  } from 'ngx-mask';
import { NgChartsModule } from 'ng2-charts';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SpinnerInterceptor } from '../core/interceptor/spinner/spinner.interceptor';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LightboxModule } from 'ngx-lightbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { CustomPaginationModule } from './custom-pagination/custom-pagination.module';
import { NgxEditorModule } from 'ngx-editor';


@NgModule({ exports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MaterialModule,
        NgApexchartsModule,
        NgxBootstrapModule,
        PaginationModule,
        NgxMaskModule,
        NgChartsModule,
        FullCalendarModule,
        AngularEditorModule,
        NgxDropzoneModule,
        LightboxModule,
        MatTooltipModule,
        BsDatepickerModule,
        CarouselModule,
        NgxMatIntlTelInputComponent,
        CustomPaginationModule,
        NgxEditorModule
    ], imports: [FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MaterialModule,
        NgApexchartsModule,
        NgxBootstrapModule,
        PaginationModule,
        NgxEditorModule,
        NgxMaskModule.forRoot(),
        NgChartsModule.forRoot(),
        FullCalendarModule,
        AngularEditorModule,
        NgxDropzoneModule,
        LightboxModule,
        MatTooltipModule,
        BsDatepickerModule.forRoot(),
        CarouselModule,
        NgxMatIntlTelInputComponent,
        CustomPaginationModule,
        NgxEditorModule], providers: [
        BsDatepickerConfig,
        { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class SharedModule {}
