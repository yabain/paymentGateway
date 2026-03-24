import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit {
  @Input() campaign: any;
  optionsData: any = [];
  picture: string = 'assets/img/icons/price-01.svg';
  quantity: number = 0;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }

}
