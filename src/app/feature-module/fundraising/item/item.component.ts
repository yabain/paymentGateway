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
    console.log('campaign: ', this.campaign);
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }


  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(price);
  }
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : (i < rating ? 0.5 : 0));
  }
  
  truncate(text: string, n: number): string {
    if (!text) return '';
    if (text.length <= n) return text;
    return text.substring(0, n) + '...';
  }
}
