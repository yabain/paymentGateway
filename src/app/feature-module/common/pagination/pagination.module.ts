import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaginationRoutingModule } from './pagination-routing.module';
import { PaginationComponent } from './pagination.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [PaginationComponent],
    exports: [PaginationComponent], imports: [CommonModule,
        PaginationRoutingModule,
        FormsModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class PaginationModule {}
