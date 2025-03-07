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
      "amount": paymentData.payment,
      "type": "deposit",
      "paymentMode": "ORANGE",
      "moneyCode": "XAF",
      "userRef": {
        "fullName": paymentData.name,
        "account": `${paymentData.phone}`
      },
      "raison": 'Paiement de facture',
      "appID": paymentGatwayAPIKey

    }
    console.log("depositData", depositData);
    console.log("endpoint: ", depositEndPoint);

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

  getPaymentStatus(paymentRef: string, invoiceId?: string): Observable<any> {
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

  chekStatus(res: any, userId: string, invoiceData: any) {
    const updateInvoiceStatus = (status: string, errorMsg?: string) => {
      invoiceData.status = status;
      if (errorMsg) {
        invoiceData.statusMsg = errorMsg;
      }
      this.firestore.addObjectToMap(`invoices/${userId}`, invoiceData.eventId, invoiceData.id, invoiceData)
        .then(() => {
          if (errorMsg) {
            this.toastService.error(errorMsg, 'danger', {timeOut: 10000});
          } else if (status === 'Completed') {
            this.toastService.success(res, 'success');
          }
        });
    };

    switch (res.data.state) {
      case 'financial_transaction_pending':
        invoiceData.status = 'Pending';
        setTimeout(() => {
          // this.checkTransactionStatus(invoiceData.ref.token)
          //   .subscribe(data => {
          //     if (data.data.state === 'financial_transaction_success') {
          //       updateInvoiceStatus('Completed');
          //     }
          //     this.chekStatus(data, userId, invoiceData);
          //   });
        }, 3000);
        break;

      case 'financial_transaction_success':
        updateInvoiceStatus('Completed');
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
        updateInvoiceStatus('Rejected', errorMsg);

        break;

      default:
        console.warn('Unexpected transaction state:', res.data.state);
    }
  }

  getTransactionData(userId: string, eventId: string, invoiceId: string): Observable<any> {
    return this.firestore.readField(`invoices/${userId}`, eventId)
      .pipe(
        tap(invoiceList => {
          if (!invoiceList) {
            throw new Error('Invoice not found');
          }
          invoiceList = Object.values(invoiceList)
          invoiceList = invoiceList.filter(invoice => invoice.id == invoiceId)
          return invoiceList;
        })
      );
  }

  getPaymentGatewayKey() {
    return this.firestore.readField(`systemConfig/config`, `paymentGatwayAPIKey`)
      .pipe(take(1));
  }
}
