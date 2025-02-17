import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { AuthService, routes } from 'src/app/core/core.index';
import { FacturationService } from 'src/app/core/services/facturation/facturation.service';
import { PaymentService } from 'src/app/core/services/payment/payment.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.scss'],
})
export class MakePaymentComponent {
  isDisabled: boolean = false;
  loadingData: boolean = true;
  loadingInvoice: boolean = true;
  invoiceData: any;
  transactionData: any = [];
  printing: boolean = false;
  showOrdes: boolean = false;
  invoiceId!: string;
  form!: FormGroup;
  finalPayment: number = 0;
  name: string = '';
  phone: any = '';
  email: string = '';
  paying: boolean = false;
  private isProcessingSuccess = false; // Flag to break multiples exécutions

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private userService: UserService,
    private route: ActivatedRoute,
    private facturationService: FacturationService,
    private paymentService: PaymentService

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

  initForm(invoiceData: any) {
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

  getInvoiceData(invoiceId: string) {
    this.facturationService.getInvoiceData(invoiceId)
      .subscribe((res: any) => {
        console.log('la res: ', res);
        if (res) {
          this.initForm(res);
          this.finalPaymentCalculation(res);
          this.invoiceData = res;
          this.isDisabled = res.status;
          this.name = res.name;
          this.email = res.email;
          this.phone = res.phone;
          this.loadingData = false;
          return;
        } else {
          this.toastService.error('Cette facture n\'est pas dans notre système', 'facture introuvable');
          this.loadingData = false;
          return;
        }
      })
  }

  finalPaymentCalculation(invoiceData: any) {
    let ir: number = 0;
    let yn: number = 0;
    if (invoiceData.ir) {
      ir = ((invoiceData.payment * 5.5) / 100);
    }
    if (invoiceData.yn) {
      yn = ((invoiceData.payment * 2) / 100);
    }
    this.finalPayment = Number(invoiceData.payment) + ir + yn;
  }

  submit() {
    console.log('Invoice data: ', this.form.value);

    // Form verification
    if (this.verifyForm() === false) return;

    let transaction = { ...this.form.value };
    transaction.invoiceId = this.invoiceData.id;
    transaction.id = this.facturationService.generateId();
    transaction.date = new Date();
    transaction.payment = this.aroundValue(Number(this.finalPayment))
    this.transactionData = transaction;

    console.log('transaction data: ', transaction);

    this.paying = true;
    // return
    this.paymentService.getPaymentGatewayKey()
    .subscribe((res: string) => {
      if (res){
        this.paymentService.deposit(this.transactionData, res)
        .pipe(take(1))
        .subscribe(res => {
             console.log('Ici res du backend: ', res);

          if (res.statusCode === 201) {
            // Manage success request
            // this.handleSuccessfulRequest(res, val);
          } else {
            // Gestion des erreurs liées au code de statut
            // this.handleTransactionErrors(res.statusCode);
          }
          this.paying = false;
        },
          error => {
              this.toastService.error('Impossible d\'effectuer le payment', 'Erreur');
            console.error('Erreur pendant le dépôt:', error);
            this.paying = false;
          }
        );
      }
    })
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

  aroundValue(val: number) {
    return Math.ceil(val);
  }

  verifyForm(): boolean {
    // Payer phone validation
    if (this.form.controls['phone'].status === "INVALID") {
      this.toastService.warning('Numéro payeur Invalid', 'Erreur form');
      return false;
    }

    // Phone number verification
    if (!this.isValidPhoneNumber(this.form.value.phone)) {
      this.toastService.warning('Numéro payeur Invalid', 'Erreur form');
      return false;
    }

    // Phone number verification: Orange Cameroon
    if (!this.isValidOMPhoneNumber(this.form.value.phone)) {
      this.toastService.warning('Le numéro n\'est payeur pas un numéro Orange', 'Erreur form', {
        timeOut: 10000
      });
      return false;
    }

    if (this.form.value.payment < 100) {
        this.toastService.warning('Le montant minimale est de 100', 'Erreur form');
      return false;
    }

    // General form validation
    if (!this.form.valid) {
      this.toastService.warning('Formulaire invalide.', 'Erreur form');
      // document.getElementById("closeSaveModal").click();
      return false;
    }

    return true;
  }

  // Phone number verification
  isValidPhoneNumber(input: string): boolean {
    // Chech if string has exactly 9 numbers
    const isNineDigits = /^\d{9}$/.test(input);
    return isNineDigits;
  }

  // Phone number verification: Orange Cameroon
  isValidOMPhoneNumber(input: string): boolean {
    // Check if string start with 69 or 655 to 659
    const startsWithValidPrefix = /^69|65[5-9]/.test(input);
    return startsWithValidPrefix;
  }
}
