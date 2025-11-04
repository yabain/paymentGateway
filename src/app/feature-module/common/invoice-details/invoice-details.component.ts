// json-viewer.component.ts
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService } from 'src/app/services/user/user.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Subject } from 'rxjs/internal/Subject';
import { DateService } from 'src/app/services/pipe/date.service';
@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
})
export class InvoiceDetailsComponent implements OnInit, OnDestroy {
  @Input() transactionData: any;
  currentUser: any;
  status: string = 'transaction_initialized';

  @ViewChild('closeModal') closeModal: ElementRef;

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
    private toastService: ToastService,
    private dateService: DateService
  ) {
    this.getCurrentUser();
    console.log('transactionData', this.transactionData);
  }

  ngOnInit(): void {
  }

  formatDate(dateStr: string, format = 'short', lang = 'en') {
    return this.dateService.formatDate(dateStr, format, lang)
  }

  unitPrice(transactionData){
    return Number(transactionData?.estimation) / Number(transactionData?.quantity);
  }
  
  async getCurrentUser() {
    this.currentUser = await this.userService.getCurrentUser();
    console.log('currentUser', this.currentUser);
  }

  ngAfterViewInit() {
    if (this.closeModal) {
      this.closeModal.nativeElement.click();
    }
  }

  closeModalClick() {
    if (this.closeModal) {
      this.closeModal.nativeElement.click();
    }
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }
  
  
  ngOnDestroy(): void {
  }
}
