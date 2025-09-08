import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-flutterwave',
  templateUrl: './flutterwave.component.html',
  styleUrls: ['./flutterwave.component.scss'],
})
export class FlutterwaveComponent implements OnInit, OnDestroy {
  countriesData: any[] = [];
  selectedCountry: any;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {
    this.countriesData = JSON.parse(localStorage.getItem(environment.countries_data));
  }

  selectCountry(country: any) {
    this.selectedCountry = country;
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.verifyRoute();
    });
  }

  verifyRoute() {
    setTimeout(() => {
      const page = this.router.url;
      if (page.split('page')[1]) {
        const countryId = page.split('page/')[1];
        this.selectedCountry = this.countriesData.find(c => c._id === countryId);
      } else this.selectedCountry = this.countriesData[0];
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
