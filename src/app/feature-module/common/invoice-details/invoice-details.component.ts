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
import { NumberToWordsService } from 'src/app/services/number-to-words/number-to-words.service';
import * as QRCode from 'qrcode';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
})
export class InvoiceDetailsComponent implements OnInit, OnDestroy {
  @Input() transactionData: any;
  @Input() inModal?: boolean = false;
  showInvoice: boolean = true;
  currentUser: any;
  status: string = 'transaction_initialized';
  planData: any
  logoUrl: string = 'assets/img/resources/dk_logo.png';
  qrCode: string;
  itemData: any;
  appName: string = environment.appName;
  frontUrl: string = environment.frontUrl;
  frontDomain: string = environment.frontDomain;

  @ViewChild('closeModal') closeModal: ElementRef;

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
    private toastService: ToastService,
    private dateService: DateService,
    private subscriptionService: SubscriptionService,
    private numberToWordsService: NumberToWordsService
  ) {
    this.getCurrentUser();
  }

  ngOnInit(): void {
    this.showInvoice = this.transactionData.transactionType === "subscription" ? false : true;
    console.log('InvoiceDetailsComponent', this.transactionData);
  }

  getItemOfSubscription(transactionId){
    this.subscriptionService.getItemSubscriptionByTransactionId(transactionId)
    .subscribe((data: any) => {
      console.log('getItemOfSubscription', data);
      this.itemData = data;
      this.showInvoice = true;
    })
  }

  getDate(dateStr: string) {
    return this.dateService.formatDate(dateStr, 'short', this.currentUser?.language || 'fr');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactionData'] && this.transactionData) {
      this.qrCode = this.frontUrl + '/invoice/' + this.transactionData._id;
      if (this.transactionData.transactionType === 'subscription') {
        this.getPlanDataById(this.transactionData.planId);
        this.getItemOfSubscription(this.transactionData._id);
      }
    }
  }

  numberToWords(value: number): string {
    if (!value || isNaN(value)) return 'zéro';
    return this.numberToWordsService.convert(value, this.currentUser?.language || 'fr');
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
