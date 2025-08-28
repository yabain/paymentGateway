import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/core/core.index';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { UserService } from 'src/app/services/user/user.service';


interface data {
  value: string;
}
@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit {
  currentUser!: any;
  statistics!: any;
  title: string = "";
  subTitle: string = "";
  imageUrl: string = "assets/img/icons/price-01.svg";
  cycle: string = "monthly"; // yearly | monthly | weekly | dayly
  description: string = "";
  isActive: boolean = true;
  price: string = "0";
  currency: string = "";
  subscriberNumber: number = 0;
  planData!: any;

  gettingStatistics: boolean = true;
  constructor(
    private subscriptionService: SubscriptionService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getStat() {
    this.gettingStatistics = true;
    this.subscriptionService.getPlanStatistics().subscribe((data: any) => {
      this.statistics = data;
      this.gettingStatistics = false;
    });
  }

  getCurrentUser(){
    this.userService.getCurrentUser()
    .then((user: any) => {
      if(!user) return "No user";
      this.currentUser = user;
      this.currency = user.countryId.currency;
      return this.getStat();
    })
  }

  formatAmount(event: any) {
    let value = event.target.value.replace(/\s/g, ''); // Supprime les espaces existants
    value = value.replace(/\D/g, ''); // Supprime tout ce qui n'est pas un chiffre

    // Ajoute un espace tous les 3 chiffres
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Met à jour la valeur dans le modèle et l'input
    this.price = value;
    event.target.value = value;
  }

  getCleanAmount(): number {
    const cleanValue = this.price.replace(/\s/g, '');
    return ( parseFloat(cleanValue) || 0);
  }

  public routes = routes;
  public selectedValue1 = '';
  public selectedValue2 = '';

  selectedList1: data[] = [
    { value: 'Monthly' },
    { value: 'Yearly' },
    { value: 'Free Trail' },
  ];
  selectedList2: data[] = [{ value: 'Fixed' }, { value: 'Percentage' }];
  public toggleData = false;
  openContent() {
    this.toggleData = !this.toggleData;
  }
}
