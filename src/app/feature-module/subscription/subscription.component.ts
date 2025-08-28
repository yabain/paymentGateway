import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit {
isPackage: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(){
      this.verifyRoute();
    }

  togglePackageRoute(){
    this.isPackage = !this.isPackage;
  }

  verifyRoute(){
    setTimeout(()=>{
      const page = this.router.url;
      if(page.split('subscription/')[1] === "packages") {
        this.isPackage = true
      } else this.isPackage = false;
    }, 200)
  }
}
