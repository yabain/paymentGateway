// src/app/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, map, catchError, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  constructor(
    private http: HttpClient,
    private firestore: FirestoreService,
    private toastService: ToastrService,
  ) {
  }

  deposit(paymentData: any, paymentGatwayAPIKey: any) {
    // console.log('datat: ', paymentData);
    const depositEndPoint = environment.apiUrl + "/payment/pay";
    const depositData = {
      "amount": paymentData.paymentWithTaxes,
      "type": "deposit",
      "paymentMode": "ORANGE",
      "moneyCode": "XAF",
      "userRef": {
        "fullName": paymentData.clientName,
        "account": `${paymentData.paymentMethodeNumber}`
      },
      "raison": paymentData.designation,
      "appID": paymentGatwayAPIKey

    }
    // console.log("depositData", depositData);
    // console.log("endpoint: ", depositEndPoint);

    return new Observable<any>(observer => {
      this.http.post<any>(depositEndPoint, depositData)
        .subscribe(
          (response) => {
            //    console.log('res du backend', response)
            observer.next(response);
            // console.log("la réponse depuis le service de paiement: ", response);
            observer.complete();
          },
          (error) => {
            observer.error(error);
            observer.complete();
          }
        );
    });
  }

  checkTransactionStatus(paymentRef: string, invoiceId?: string): Observable<any> {
    // console.log('paymentRef: ', paymentRef);
    const checkDepositEndPoint = environment.apiUrl + "/payment/check/" + paymentRef;

    return this.http.get<any>(checkDepositEndPoint).pipe(
      tap((response) => {
        return response;
        // console.log('response of check: ', response);
      }),
      catchError((error) => {
        // console.error('Error occurred while checking transaction:', error);
        return throwError(error);
      })
    );
  }

  generateId(): string {
    const now = new Date();

    // Generate the components of the date and time
    const year = now.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = this.padNumber(now.getMonth() + 1, 2); // Months are zero-based, hence the +1
    const day = this.padNumber(now.getDate(), 2);
    const hours = this.padNumber(now.getHours(), 2);
    const minutes = this.padNumber(now.getMinutes(), 2);
    const seconds = this.padNumber(now.getSeconds(), 2);

    // Generate a random number between 100 and 999
    const randomNum = Math.floor(Math.random() * 900) + 100;

    // Construct the ID
    const id = `IN${randomNum}#${year}${month}${day}${hours}${minutes}${seconds}`;

    return id;
  }

  // Helper function to pad numbers with leading zeros
  private padNumber(num: number, size: number): string {
    let s = num.toString();
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  }


  // chekStatus(res: any, userId: string, invoiceData: any) {
  //   const updateInvoiceStatus = (status: string, errorMsg?: string) => {
  //     invoiceData.status = status;
  //     if (errorMsg) {
  //       invoiceData.statusErrorMsg = errorMsg;
  //     }
  //     this.firestore.addObjectToMap(`invoices/${userId}`, invoiceData.eventId, invoiceData.id, invoiceData)
  //       .then(() => {
  //         if (errorMsg) {
  //           this.toastService.error(errorMsg, 'danger');
  //         } else if (status === 'Completed') {
  //           this.toastService.success(res, 'success');
  //         }
  //       });
  //   };

  //   switch (res.data.state) {
  //     case 'financial_transaction_pending':
  //       invoiceData.status = 'Pending';
  //       setTimeout(() => {
  //         this.checkTransactionStatus(invoiceData.ref.token)
  //           .subscribe(data => {
  //             if (data.data.state === 'financial_transaction_success') {
  //               updateInvoiceStatus('Completed');
  //             }
  //             this.chekStatus(data, userId, invoiceData);
  //           });
  //       }, 3000);
  //       break;

  //     case 'financial_transaction_success':
  //       updateInvoiceStatus('Completed');
  //       break;

  //     case 'financial_transaction_error':

  //       const errorMessages: { [key: number]: string } = {
  //         '-201': 'Payer account not found',
  //         '-202': 'Receiver account not found',
  //         '-200': 'Unknown error',
  //         '-204': 'The balance of the payer account is insufficient',
  //         '-205': 'Payment method not found',
  //         '-206': 'Invalid amount',
  //         '-207': 'Waiting for a long time error',
  //         '-208': 'Payment rejected by the payer',
  //       };
  //       const errorMsg = errorMessages[res.data.error] || 'Unknown code error';
  //       updateInvoiceStatus('Rejected', errorMsg);

  //       break;

  //     default:
  //       console.warn('Unexpected transaction state:', res.data.state);
  //   }
  // }

  // getInvoiceData(userId: string, eventId: string, invoiceId: string): Observable<any> {
  //   return this.firestore.readField(`invoices/${userId}`, eventId)
  //     .pipe(
  //       tap(invoiceList => {
  //         if (!invoiceList) {
  //           throw new Error('Invoice not found');
  //         }
  //         invoiceList = Object.values(invoiceList)
  //         invoiceList = invoiceList.filter(invoice => invoice.id == invoiceId)
  //         return invoiceList;
  //       })
  //     );
  // }

}
