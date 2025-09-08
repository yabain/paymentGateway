import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
})
export class MessagingComponent implements OnInit, OnDestroy {
  isMail: boolean = false;
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
    this.isAdminRoute = url.includes('admin-massaging');
    console.log("isAdminRoute: ", this.isAdminRoute)
  }

  togglePackageRoute() {
    this.isMail = !this.isMail;
  }

  verifyRoute() {
    setTimeout(() => {
      const page = this.router.url;
      if (page.split('admin-massaging/')[1] === 'mail') {
        this.isMail = true;
      } else this.isMail = false;
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
