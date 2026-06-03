import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  isPackage: boolean = false;
  isAdminRoute: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {
    this.getId();
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.verifyRoute();
    });
  }


  getId() {
    const url = this.location.path();
    this.isAdminRoute = url.includes('admin-subscription');
  }

  togglePackageRoute() {
    this.isPackage = !this.isPackage;
  }

  verifyRoute() {
    setTimeout(() => {
      const page = this.router.url;
      if (page.split('subscription/')[1] === 'packages') {
        this.isPackage = true;
      } else this.isPackage = false;
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
