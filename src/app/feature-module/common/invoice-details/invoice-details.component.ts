// json-viewer.component.ts
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService } from 'src/app/services/user/user.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Subject } from 'rxjs/internal/Subject';
import { DateService } from 'src/app/services/pipe/date.service';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
})
export class InvoiceDetailsComponent implements OnInit, OnDestroy {
  @Input() transactionData: any;
  currentUser: any;
  status: string = 'transaction_initialized';
  planData: any

  @ViewChild('closeModal') closeModal: ElementRef;

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
    private toastService: ToastService,
    private dateService: DateService,
    private subscriptionService: SubscriptionService
  ) {
    this.getCurrentUser();
    console.log('transactionData', this.transactionData);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactionData'] && this.transactionData) {
      if (this.transactionData.transactionType === 'subscription') {
        this.getPlanDataById(this.transactionData.planId);
      }
    }
  }

  formatDate(dateStr: string, format = 'short', lang = 'en') {
    return this.dateService.formatDate(dateStr, format, lang)
  }

  unitPrice(transactionData){
    return Number(transactionData?.estimation) / Number(transactionData?.quantity);
  }
  
  async getPlanDataById(planId: string): Promise<any> {
    this.planData = undefined;
    this.subscriptionService.getMyPlansData(planId).subscribe((data: any) => {
      console.log('planData', data);
      return this.planData = data;
    });
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
