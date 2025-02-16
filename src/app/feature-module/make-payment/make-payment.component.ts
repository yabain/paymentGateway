import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { AuthService, routes } from 'src/app/core/core.index';
import { FacturationService } from 'src/app/core/services/facturation/facturation.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.scss'],
})
export class MakePaymentComponent {
  loadingData: boolean = true;
  loadingInvoice: boolean = true;
  invoiceData: any;
  printing: boolean = false;
  showOrdes: boolean = false;
  invoiceId!: string;
  form!: FormGroup;
  finalPayment: number = 0;
  private isProcessingSuccess = false; // Flag to break multiples exécutions

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private userService: UserService,
    private route: ActivatedRoute,
    private facturationService: FacturationService,
    // private paymentService: PaymentService,
    // private pdfExportService: PrintService,
  ) {
  }

  ngOnInit() {
    this.getId();
  }


  getId(): void {
    let idParam: any = this.router.url;
    idParam = idParam.split('/')[3]
       console.log('idParam', idParam);
    if (!idParam) {
      this.router.navigate(['/tabs']);
    }

    let invoiceId = idParam;
    if (!invoiceId) {
      this.router.navigate(['/']);
    }

    this.invoiceId = invoiceId;
    this.getInvoiceData(invoiceId);
  }

  initForm(invoiceData: any){
    this.form = new FormGroup({
      email: new FormControl(invoiceData.email, [Validators.email]),
      name: new FormControl(invoiceData.name, Validators.required),
      phone: new FormControl(invoiceData.phone, Validators.required),
      service: new FormControl(invoiceData.service, [Validators.required]),
      description: new FormControl(invoiceData.description, [Validators.required]),
      language: new FormControl(invoiceData.language, [Validators.required]),
      currency: new FormControl(invoiceData.currency, [Validators.required]),
      payment: new FormControl(invoiceData.payment, [Validators.required]),
      rest: new FormControl(invoiceData.rest, [Validators.required]),
      ir: new FormControl(invoiceData.ir),
      yn: new FormControl(invoiceData.yn),
      status: new FormControl(invoiceData.status),
    });
  }

  getInvoiceData(invoiceId: string){
    this.facturationService.getInvoiceData(invoiceId)
    .subscribe((res: any) => {
      console.log('la res: ', res);
      if (res){
        this.initForm(res);
        this.finalPaymentCalculation(res);
        this.invoiceData = res;
        this.loadingData = false;
        return;
      } else {
        this.toastService.error('Cette facture n\'est pas dans notre système', 'facture introuvable');
        this.loadingData = false;
        return;
      }
    })
  }

  finalPaymentCalculation(invoiceData: any){
    let ir: number = 0;
    let yn: number = 0;
    if(invoiceData.ir){
       ir = ((invoiceData.payment * 5.5) / 100);
    }
    if(invoiceData.yn){
       yn = ((invoiceData.payment * 2) / 100);
    }
    this.finalPayment = Number(invoiceData.payment) + ir + yn;
  }

  submit(){
    console.log('le form: ', this.form.value);
  }

  navigateToOrders(): void { this.router.navigate(['/tabs/orders']); }

  chekStatus(res: any, payment?: number) {
    switch (res.data.state) {
      case 'financial_transaction_pending':
        // Assurez-vous de ne pas relancer le polling si la transaction est déjà en traitement
        if (!this.isProcessingSuccess) {
          this.invoiceData.status = 'Pending';
          setTimeout(() => {
            // this.getPaymentStatus(this.invoiceData);
          }, 3000);
        }
        break;

      case 'financial_transaction_success':
        if (!this.isProcessingSuccess) {
          this.invoiceData.status = 'Completed';
          this.updateInvoiceStatus('Completed');
        }
        break;

      case 'financial_transaction_error':
                          const errorMessages: { [key: number]: string } = {
                            '-201': 'Payer account not found',
                            '-202': 'Receiver account not found',
                            '-200': 'Unknown error',
                            '-204': 'The balance of the payer account is insufficient',
                            '-205': 'Payment method not found',
                            '-206': 'Invalid amount',
                            '-207': 'Waiting for a long time error',
                            '-208': 'Payment rejected by the payer',
                          };
                          const errorMsg = errorMessages[res.data.error] || 'Erreur inconnue';
                          this.updateInvoiceStatus('Rejected', errorMsg);
        break;

      default:
        console.warn('Unexpected transaction state:', res.data.state);
    }
  }

  updateInvoiceStatus(status: string, errorMsg?: string) {
    this.invoiceData.status = status;
    if (errorMsg) {
      this.invoiceData.statusErrorMsg = errorMsg;
    }
  };
}
