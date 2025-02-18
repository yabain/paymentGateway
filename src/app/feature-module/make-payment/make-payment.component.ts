import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { FacturationService } from 'src/app/core/services/facturation/facturation.service';
import { PaymentService } from 'src/app/core/services/payment/payment.service';
import { PrintService } from 'src/app/core/services/print/print.service';

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.scss'],
})
export class MakePaymentComponent {
  isDisabled: boolean = false;
  loadingData: boolean = true;
  invoiceData: any;
  transactionData!: any;
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
    private facturationService: FacturationService,
    private paymentService: PaymentService,
    private pdfExportService: PrintService
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
          this.getTransactionsList(res.id);
          this.loadingData = false;
          return;
        } else {
          this.toastService.error('Cette facture n\'est pas dans notre système', 'Facture introuvable', {
            timeOut: 10000
          });
          this.loadingData = false;
          return;
        }
      })
  }

  getTransactionsList(invoiceId: string) {
    this.facturationService.getTransactionsList(invoiceId)
    .pipe(take(1))
      .subscribe((res: any) => {
        if(res) res = Object.values(res);
        console.log('lieste des transactions', res);
        if (res && this.invoiceData?.status === true) {
          console.log('la transaction completed 0: ', this.transactionData)
          this.transactionData = res.filter(e => e.status === 'Completed')[0];
          console.log('la transaction completed: ', this.transactionData)
        }
        else if (res && this.invoiceData.status === false) {
          if (res.filter(e => e.status === 'Completed')[0]) {
            this.transactionData = res.filter(e => e.status === 'Completed')[0]
            console.log('la transaction test: ', this.transactionData)
            this.updateInvoiceData(this.invoiceData);
          }
          else if (res.filter(e => e.status === 'Pending')[0]) {
            this.transactionData = res.filter(e => e.status === 'Pending')[0]
            this.check(this.transactionData.ref.token);
          }
        }
        console.log('transactionsData: ', this.transactionData);
        console.log('paying: ', this.paying);
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
    this.finalPayment = this.aroundValue(Number(invoiceData.payment) + ir + yn);
  }

  submit() {
    this.transactionData = [];
    console.log('Invoice data: ', this.form.value);

    // Form verification
    if (this.verifyForm() === false) return;

    let transaction = { ...this.form.value };
    console.log('transaction data: 0', transaction);
    transaction.invoiceId = this.invoiceData.id;
    transaction.id = this.facturationService.generateId('TR');
    transaction.date = new Date();
    transaction.payment = this.aroundValue(Number(this.finalPayment))
    this.transactionData = transaction;

    console.log('transaction data: ', transaction);
    console.log('this.transaction data: ', this.transactionData);

    this.paying = true;
    // return
    this.paymentService.getPaymentGatewayKey()
      .subscribe((key: string) => {
        if (key) {
          this.paymentService.deposit(this.transactionData, key)
            .pipe(take(1))
            .subscribe(res => {
              console.log('Ici res du backend: ', res);

              if (res.statusCode === 201) {
                // Manage success request
                this.facturationService.handleSuccessfulRequest(this.transactionData, res)
                  .then((response: any) => {
                    this.transactionData = response.data;
                    if (response.status === 'Pending') {
                      this.chekStatus(res);
                    }
                    else {
                      this.facturationService.handleTransactionStateError(this.transactionData, res)
                    }
                  })
              } else {
                // Gestion des erreurs liées au code de statut
                this.facturationService.handleTransactionStateError(this.transactionData, res);
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


  chekStatus(res: any) {
    console.log('le test de res 000: ', res);
    switch (res.data.state) {
      case 'financial_transaction_pending':
        this.transactionData.status = 'Pending';
        setTimeout(() => {
          console.log('retest');
          this.check(this.transactionData.ref.token);
        }, 5000);
        break;

      case 'financial_transaction_success':
        console.log('test matin: ', res);
        this.updateTransactionStatus('Completed', res);
        this.exportToPdf();
        this.updateInvoiceData(this.invoiceData);
        this.isProcessingSuccess = true;
        break;

      case 'financial_transaction_error':
        const errorMessages: { [key: number]: string } = {
          '-201': 'Compte Orage Money introuvable',
          '-202': 'Receiver account not found',
          '-200': 'Erreur inconnue',
          '-204': 'Le solde du compte OM payeur insufisant, veuillez recharger votre compte OM',
          '-205': 'Méthode de paiment invalide',
          '-206': 'Montant invalide',
          '-207': 'Longue attente serveur',
          '-208': 'La transaction a été rejeté par le payeur',
        };
        const errorMsg = errorMessages[res.data.error] || 'Erreur inconnue';
        // this.isProcessingSuccess = false;
        this.updateTransactionStatus('Rejected', res, errorMsg);
        break;

      default:
        console.warn('Unexpected transaction state:', res.data.state);
    }
  }

  check(token) {
    console.log('Dans le check, tokrn: ', token);
    this.paymentService.getPaymentStatus(token)
      .subscribe(response => {
        console.log('le test de res 111: ', response);
        if (response && response.data.state === 'financial_transaction_pending') {
          this.chekStatus(response);
        } else {
          this.chekStatus(response);
          this.facturationService.handleSuccessfulRequest(this.transactionData, response)
        };
      })
  }

  updateInvoiceData(invoiceData) {
    console.log('update InvoiceData: ', invoiceData);
    invoiceData.name = this.transactionData.name;
    invoiceData.phone = this.transactionData.phone;
    invoiceData.email = this.transactionData.email;
    invoiceData.status = true;
    this.facturationService.updateInvoice(invoiceData);
  }

  updateTransactionStatus(status: string, res, errorMsg?: string) {
    this.transactionData.status = status;
    console.log('le test de res: ', res);
    if (errorMsg) {
      this.transactionData.statusMsg = errorMsg;
    }
    this.facturationService.handleSuccessfulRequest(this.transactionData, res)
  }

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

    // if (this.form.value.payment < 10) {
    //   this.toastService.warning('Le montant minimale est de 10', 'Erreur form');
    //   return false;
    // }

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


  public exportToPdf(): void {
    // console.log('exportation de pdf');
    if (this.invoiceData) {
      this.toastService.info("Téléchargement en cours...", "PDF", {
        timeOut: 10000,
        closeButton: true,
      });
      this.printing = true;
      setTimeout(() => {
        this.pdfExportService.generatePdf('printableView', 'Recu_' + this.transactionData.id + '.pdf');
        // this.printing = false;
      }, 2000);
    }
  }
}
