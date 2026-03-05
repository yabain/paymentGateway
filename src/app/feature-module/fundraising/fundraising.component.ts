import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-fundraising',
  templateUrl: './fundraising.component.html',
  styleUrls: ['./fundraising.component.scss'],
})
export class FundraisingComponent implements OnInit, OnDestroy {
  isAdminRoute = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {
    this.refreshRouteContext();
  }

  ngOnInit(): void {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.refreshRouteContext();
    });
  }

  private refreshRouteContext(): void {
    const url = this.location.path();
    this.isAdminRoute = url.includes('admin-fundraising');
  }

  navigateDefault(): void {
    const target = this.isAdminRoute ? '/admin-fundraising/list' : '/fundraising/my/list';
    this.router.navigate([target]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
