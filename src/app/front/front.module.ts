
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureModuleRoutingModule } from '../feature-module/feature-module-routing.module';
import { SharedModule } from '../shared/shared.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    PackageDetailsComponent
  ],
  exports: [PackageDetailsComponent],
  providers: [],
  imports: [
    CommonModule,
    FeatureModuleRoutingModule, 
    TranslateModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,],
})
export class FrontModule {}
