import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss'],
})
export class PayoutComponent implements OnInit, OnDestroy {
  page: string;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.verifyRoute();
    });
  }

  verifyRoute() {
    setTimeout(() => {
      const url = this.router.url;
      if (url.split('admin-payout/')[1]) {
        const endP = url.split('admin-payout/')[1];
        console.log('endP: ', endP)
        this.page = endP === 'payout' ? endP : 'all-payout';
      } else this.page = "payout";
      console.log("page: ", this.page)
    }, 200);
  }

  changePage(page: string){
    this.page = page;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
