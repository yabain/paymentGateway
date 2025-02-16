import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable, switchMap, take } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class FacturationService {

    constructor(
        private firestore: FirestoreService,
        private storage: StorageService,
        private authService: AuthService
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
}
