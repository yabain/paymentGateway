import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaymentService } from '../services/payment/payment.service';
import { PrintService } from '../services/print/print.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent {
  transactionData: any;
  private destroy$ = new Subject<void>();
  idParam: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private pdfExportService: PrintService,
    private toastr: ToastrService,
  ) {
    this.transactionData = JSON.parse(localStorage.getItem('transactionData'));
    console.log('transactionData: ', this.transactionData);
  }


  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getId();
    });
  }

  getId() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'null' && idParam !== 'undefined') {
      this.idParam = idParam;
      this.getTransactionById(this.idParam);

    } else {
      this.idParam = null;
    }

  }

  getTransactionById(id: string) {
    return this.paymentService.getTransactionData(id).subscribe((data) => {
      this.transactionData = data;
      console.log('transactionData: ', this.transactionData);
    })
  }

  public exportToPdf(transaction): void {
    console.log('exportation de pdf');
    if (this.transactionData) {
      this.toastr.info("Téléchargement en cours...", "PDF", {
        timeOut: 7000,
        closeButton: true,
      });
      setTimeout(() => {
        this.pdfExportService.generatePdf('showInvoice', 'invoice_' + this.transactionData.transactionRef + '.pdf');
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
