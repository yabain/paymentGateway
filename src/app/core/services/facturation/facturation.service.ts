import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable, switchMap, take } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';
import { AuthService } from '../auth/auth.service';
import { PaymentService } from '../payment/payment.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root',
})
export class FacturationService {

    constructor(
        private firestore: FirestoreService,
        private storage: StorageService,
        private authService: AuthService,
        private paymentService: PaymentService,
        private toastService: ToastrService
    ) { }

    getInvoiceData(invoiceId: string): Observable<any> {
        return this.firestore.read(`invoices/${invoiceId}`)
        // .pipe(take(1))
    }

    getAllInvoiceData(): Observable<any> {
        return this.firestore.getDocuments(`invoices`)
            .pipe(take(1))
    }

    creatInvoice(invoiceData: any): Observable<any> {
        invoiceData.id = this.generateId();
        return from(this.firestore.create(`invoices/${invoiceData.id}`, invoiceData))
            .pipe(
                map(() => {
                    return { success: true, message: 'Votre facture a bien été créé' }; // Emit the user data
                })
            );
    }


    generateId(type?: string): string {
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
        let id: string = ''
        if (type === "TR") id = `TR${randomNum}#${year}${month}${day}${hours}${minutes}${seconds}`;
        else id = `IN${randomNum}#${year}${month}${day}${hours}${minutes}${seconds}`;

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

    checkTransactionStatus(invoiceData: any) {
        let token = invoiceData.ref.token;
        //    console.log("Token:", token);

        this.paymentService.getPaymentStatus(token)
            .subscribe({
                next: (response) => {
                    //    console.log('Transaction status:', response);
                    if (response) {
                        // this.chekStatus(response, invoiceData.payment);
                    } else {
                        console.error('Invalid response');
                        // this.backClicked();
                    }
                },
                error: (err) => {
                    console.error('Error:', err);
                    //   this.backClicked();
                },
                complete: () => {
                    // this.loadingInvoice = false; // Assurez-vous de réinitialiser cet état
                },
            });
    }


    /**
     * Manage transaction success status.
     */
    handleSuccessfulRequest(res: any, transactionData: any) {
        transactionData.ref = { ref: res.data.ref, token: res.data.token };

        if (res.data.state === 'financial_transaction_pending') {
            transactionData.status = 'Pending'
            // Save invoice's data to Firebase
            this.firestore.addObjectToField(`invoices/${transactionData.invoiceId}`, transactionData.id, transactionData)
                .then(() => {
                       console.log('Le formulaire 1: ', transactionData);
                    // this.toastService.presentToast('Veuillez confirmer la transaction sur votre mobile.', 'top', 'info');
                    this.toastService.info('Veuillez confirmer le payment sur votre mobile', 'Transaction initiée');
                })
        } else if (res.data.state === 'financial_transaction_error') {
            // Gestion des erreurs spécifiques de la transaction
            this.handleTransactionStateError(res.data, transactionData);
        } else {
            this.toastService.error("Une erreur inconnue s'est produite", 'Erreur');
            return
        }
    }

    /**
     * Manage transaction errors messages.
     */
    private handleTransactionStateError(errorData, val) {
        val.status = "Rejected";

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
        // this.statusErrorMsg.message = val.statusErrorMsg = errorMessages[errorData.error] || "Unknown code error";
        // this.toastService.presentToast(val.statusErrorMsg, 'top', 'danger');
    }

}
