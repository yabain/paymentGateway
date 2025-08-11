// src/app/auth.service.ts
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, catchError, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { from, Observable, of, throwError } from "rxjs";
import { ToastService } from "../toast.service";
import { TranslateService } from "@ngx-translate/core";
import { ApiService } from "../api/api.service";
import { StorageService } from "../storage/storage.service";

@Injectable({
  providedIn: "root",
})
export class ExchangeService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private storage: StorageService
  ) {}

  localConvertion(rates, fromCurrency, toCurrency, amount = 1): number {
    const rateFromUSDToFrom = rates[fromCurrency];
    const rateFromUSDToTo = rates[toCurrency];
    const amountInUSD = amount / rateFromUSDToFrom;
    const convertedAmount = amountInUSD * rateFromUSDToTo;
    return Number(convertedAmount.toFixed(2));
  }

  proceedCurrencyConvertion(
    fromCurrency,
    toCurrency,
    amount = 1
  ): Promise<any> {
    console.log("proceedCurrencyConvertion Service ");
    return new Promise((resolve, reject) => {
      try {
        this.apiService
          .post("exchange/convertCurrency", {
            fromCurrency,
            toCurrency,
            amount,
          })
          .subscribe(
            (resp: any) => {
              if (resp) {
                resolve(resp); // Résoudre la Promise avec user.userData
              } else {
                resolve(false); // Résoudre la Promise avec false
              }
            },
            (error) => {
              console.error("Error getting favorites:", error);
              reject(error); // Rejeter la Promise en cas d'erreur
            }
          );
      } catch (e) {
        reject(e); // Rejeter la Promise en cas d'exception
      }
    });
  }

  getExchangeRate(): Observable<any> {
    const endPoint = environment.backendUrl + "/exchange/getExchangeRate";
    return this.http.get<any>(endPoint).pipe(
      tap((response) => {
        return response;
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  getOtherExchangeRate(): Observable<boolean> {
    return this.apiService.getWithoutId(`exchange/other-rates`).pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error("Error getting favorites:", err);
        return of(false); // Emit false if there's an error
      })
    );
  }

  getTransactionData(transactionId: string): Observable<boolean> {
    return this.apiService.getById(`transaction`, transactionId).pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error("Error getting favorites:", err);
        return of(false); // Emit false if there's an error
      })
    );
  }
}
