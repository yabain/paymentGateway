import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { JsonViewerComponent } from '../common/json-viewer/json-viewer.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';

@NgModule({
  declarations: [JsonViewerComponent, TransactionDetailsComponent],
  imports: [CommonModule, TranslateModule],
  exports: [JsonViewerComponent, TransactionDetailsComponent],
})
export class CommonItemModule {}