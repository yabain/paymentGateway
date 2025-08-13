import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap, take } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';
import { PaymentService } from '../payment/payment.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth/auth.service';

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

    getTransactionsList(invoiceId: string): Observable<any> {
        return this.firestore.read(`transactions/${invoiceId}`)
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

    updateInvoice(invoiceData: any): Observable<any> {
        return from(this.firestore.update(`invoices/${invoiceData.id}`, invoiceData))
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

    checkTransactionStatus(invoiceData: any): Observable<any> {
        return new Observable((observer) => {
            let token = invoiceData.ref.token;
            console.log("Token:", token);

            this.paymentService.getPaymentStatus(token).subscribe({
                next: (response) => {
                    if (response) {
                        // Émettre la réponse pour les souscripteurs
                        observer.next(response);

                        // Appeler la méthode pour vérifier le statut
                        //   this.chekStatus(response, invoiceData.payment);
                    } else {
                        console.error('Invalid response');
                        observer.error('Invalid response'); // Émettre une erreur
                        //   this.backClicked();
                    }
                },
                error: (err) => {
                    console.error('Error:', err);
                    observer.error(err); // Émettre une erreur
                    // this.backClicked();
                },
                complete: () => {
                    // this.loadingInvoice = false; // Réinitialiser l'état
                    observer.complete(); // Indiquer que l'Observable est terminé
                },
            });
        });
    }


    /**
     * Manage transaction success status.
     */
    handleSuccessfulRequest(transactionData: any, res: any): Promise<any> {
        // Vérification de res et res.data
        if (!res || !res.data) {
            console.error('Données de réponse invalides:', res);
            this.toastService.error("Données de réponse invalides", "Erreur");
            return Promise.reject("Données de réponse invalides");
        }

        console.log('Données de réponse Ici ici:', res);
        // Ajout des références
        if (!transactionData.ref) {
            transactionData.ref = { ref: res.data.ref, token: res.data.token };
        }

        if (res.data.state === 'financial_transaction_pending') {
            transactionData.status = 'Pending';
            console.log("Données finales de transaction à sauvegarder: ", transactionData);

            // Sauvegarde dans Firebase
            return this.firestore.addObjectToField(`transactions/${transactionData.invoiceId}`, transactionData.id, transactionData)
                .then(() => {
                    console.log('Le formulaire a bien été enregistré:', transactionData);
                    let response: any = { status: 'Pending', data: transactionData };
                    // this.toastService.info('Veuillez confirmer le paiement sur votre mobile', 'Transaction initiée');
                    return Promise.resolve(response);
                })
                .catch((error) => {
                    console.error('Erreur lors de la sauvegarde des données:', error);
                    this.toastService.error('Erreur lors de la sauvegarde des données', 'Erreur');
                    return Promise.reject({ status: 'Error', data: transactionData });
                });
        }

        if (res.data.state === 'financial_transaction_success') {
            transactionData.status = 'Completed';
            console.log("Données finales de transaction Completed à sauvegarder: ", transactionData);

            // Sauvegarde dans Firebase
            return this.firestore.addObjectToField(`transactions/${transactionData.invoiceId}`, transactionData.id, transactionData)
                .then(() => {
                    let response: any = { status: 'Completed', data: transactionData };
                    // this.toastService.success('Veuillez confirmer le paiement sur votre mobile', 'Transaction initiée');
                    return Promise.resolve(response);
                })
                .catch((error) => {
                    console.error('Erreur lors de la sauvegarde des données Success:', error);
                    this.toastService.error('Erreur lors de la sauvegarde des données', 'Erreur');
                    return Promise.reject({ status: 'Error', data: transactionData });
                });
        }

        if (res.data.state === 'financial_transaction_error') {
            console.log('Erreur financière détectée');
            this.handleTransactionStateError(transactionData, res);
            return Promise.resolve({ status: 'Error', data: transactionData });
        }

        console.log('Erreur inconnue détectée');
        this.handleTransactionStateError(transactionData, res);
        this.toastService.error("Une erreur inconnue s'est produite", 'Erreur');
        return Promise.reject({ status: 'Error', data: transactionData });
    }


    /**
     * Manage transaction errors messages.
     */
    handleTransactionStateError(transactionData, res): Promise<any> {
        transactionData.status = "Rejected";
        transactionData.ref = { ref: res.data.ref, token: res.data.token };

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

        transactionData.statusMsg = errorMessages[res.data.error] || "Erreur inconnue";
        this.toastService.error(transactionData.statusMsg, 'Erreur', { timeOut: 10000 });

        return this.firestore.addObjectToField(`transactions/${transactionData.invoiceId}`, transactionData.id, transactionData)
            .then(() => {
                console.log('Le formulaire a bien été sauvegardé: ', transactionData);
                return { status: true, data: transactionData }; // Retourne une Promesse
            })
            .catch((error) => {
                console.error('Erreur lors de la sauvegarde des données:', error);
                return { status: false, data: transactionData }; // Retourne une Promesse en cas d'erreur
            });
    }

}
