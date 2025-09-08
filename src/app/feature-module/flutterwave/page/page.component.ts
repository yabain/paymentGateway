import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FlutterwaveService } from 'src/app/services/flutterwave/flutterwave.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() country: any;
  status: boolean = true;
  waitingData: boolean = false;
  countriesData: any[] = [];
  selectedCountry: any;
  gettingTransactions: boolean = true;
  gettingSolde: boolean = true;
  soldeListe: any[] = [];
  solde: any;
  otherSolde: any[] = [];
  gettingPayinTransactions: boolean = true;
  gettingPayoutTransactions: boolean = true;
  payinList: any[] = [];
  payoutList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fw: FlutterwaveService,
  ) {
    this.countriesData = JSON.parse(
      localStorage.getItem(environment.countries_data),
    );
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.verifyRoute();
    });
  }

  verifyRoute() {
    const page = this.router.url;
    if (page.split('page')[1]) {
      const countryId = page.split('page/')[1];
      this.selectedCountry = this.countriesData.find(
        (c) => c._id === countryId,
      );
    } else this.selectedCountry = this.countriesData[0];
    this.getData();
  }

  getData() {
    this.getSolde();
    this.getPayinList();
    this.getPayoutList();
  }

  getSolde() {
    this.gettingSolde = true;
    this.fw.getApplicationBalance(this.selectedCountry.iso2).subscribe({
      next: (res: any) => {
        this.soldeListe = res.data;
        this.solde = this.soldeListe.find(
          (s) => s.currency === this.selectedCountry.currency,
        );
        this.solde = this.solde ? this.solde.available_balance : 0;
        this.otherSolde = this.soldeListe.filter((s) => s.available_balance > 0)
        this.gettingSolde = false;
      },
      error: (err) => {
        this.gettingSolde = false;
        console.log(err);
      },
    });
  }

  getPayinList() {
    this.gettingPayinTransactions = true;
    this.fw.getPayinList(this.selectedCountry.iso2).subscribe({
      next: (res: any) => {
        this.payinList = res.data;
        this.gettingPayinTransactions = false;
      },
      error: (err) => {
        this.gettingPayinTransactions = false;
        console.log(err);
      },
    });
  }

  getPayoutList() {
    this.gettingPayoutTransactions = true;
    this.fw.getPayoutList(this.selectedCountry.iso2).subscribe({
      next: (res: any) => {
        this.payoutList = res.data;
        this.gettingPayoutTransactions = false;
      },
      error: (err) => {
        this.gettingPayoutTransactions = false;
        console.log(err);
      },
    });
  }

  getTransactions() {
    this.gettingTransactions = true;
  }

  changeUserActiveStatus() {}

  refresh() {
    this.getData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
