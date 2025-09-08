import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { routes } from 'src/app/core/core.index';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { UserService } from 'src/app/services/user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Location } from '@angular/common';

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
  title: string = '';
  subTitle: string = '';
  imageUrl: string = 'assets/img/icons/price-01.svg';
  cycle: string = 'monthly'; // yearly | monthly | weekly | dayly
  description: string = '';
  isActive: boolean = true;
  price: string = '0';
  currency: string = '';
  subscriberNumber: number = 0;
  planData!: any;
  gettingStatistics: boolean = true;
  options: any;
  form: FormGroup;
  watingCreation: boolean = false;
  watingPlansList: boolean = true;
  plansList: any;
  plansListBackup: any;
  selectedPlan: any;
  wattingStatus: boolean = false;
  isAdmin: boolean = false;
  isAdminRoute: boolean = false;
  activeSearch: boolean = false;
  
  searchString: string = '';

  public routes = routes;
  public selectedValue1 = '';
  public selectedValue2 = '';
  selectedList2: data[] = [{ value: 'Fixed' }, { value: 'Percentage' }];
  public toggleData = false;

  openContent() {
    this.toggleData = !this.toggleData;
  }

  constructor(
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.getId();
    this.scrollToTop();
    this.getCurrentUser();
    this.planForm();
  }

  getId() {
    const url = this.location.path();
    this.isAdminRoute = url.includes('admin-subscription');
  }

  selectPlan(plan: any) {
    this.selectedPlan = plan;
  }

  public searchData(value: string): void {
    if(value){
    value = value.trim().toLowerCase();
    this.plansList = this.plansListBackup.filter((plan: any) =>
      plan.title.toLowerCase().includes(value) ||
      plan.subTitle.toLowerCase().includes(value)
    );
    } else return this.plansList = this.plansListBackup;
  }

  filterByPrice(value: number){
    if(value){
    this.plansList = this.plansListBackup.filter((plan: any) =>
      plan.price.toString().toLowerCase().includes(value)
    );
    } else return this.plansList = this.plansListBackup;
  }

  public filterByPeriod(value: string): void {
    if(value){
    value = value.trim().toLowerCase();
    this.plansList = this.plansListBackup.filter((plan: any) =>
      plan.cycle.toLowerCase().includes(value)
    );
    } else return this.plansList = this.plansListBackup;
  }

  getMyStat() {
    this.gettingStatistics = true;
    if (this.isAdmin) {
      this.subscriptionService.getPlanStatistics().subscribe((data: any) => {
        this.statistics = data;
        this.gettingStatistics = false;
      });
    } else {
      this.subscriptionService.getMyPlanStatistics().subscribe((data: any) => {
        this.statistics = data;
        this.gettingStatistics = false;
      });
    }
  }

  selectImg(imageUrl) {
    this.imageUrl = imageUrl;
  }

  toggleSearch(){
    this.activeSearch = !this.activeSearch;
    this.plansList = this.plansListBackup;
  }

  getMyPlansList() {
    this.watingPlansList = true;
    if (this.isAdmin) {
    this.subscriptionService
      .getAllPlansList()
      .subscribe((data: any) => {
        this.watingPlansList = false;
        this.plansList = data;
        this.plansListBackup = data;
      });
    } else {
    this.subscriptionService
      .getMyPlansList(this.currentUser._id)
      .subscribe((data: any) => {
        this.watingPlansList = false;
        this.plansList = data;
      });
    }
  }

  refresh() {
    this.getMyStat();
    this.getMyPlansList();
    this.scrollToTop();
  }

  getCurrentUser() {
    this.userService.getCurrentUser().then((user: any) => {
      if (!user) return 'No user';
      this.currentUser = user;
      if (this.isAdminRoute && user.isAdmin) this.isAdmin = true;
      this.currency = user.countryId.currency;
      return this.refresh();
    });
  }

  formatAmount(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');

    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    this.price = value;
    event.target.value = value;
  }

  getCleanAmount(): number {
    const cleanValue = this.price.replace(/\s/g, '');
    return parseFloat(cleanValue) || 0;
  }

  planForm() {
    this.form = new FormGroup({
      title: new FormControl(this.title, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      imageUrl: new FormControl(this.imageUrl),
      isActive: new FormControl(true),
      currency: new FormControl(this.currentUser?.countryId.currency),
      subscriberNumber: new FormControl(0),
      subTitle: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      description: new FormControl('', { validators: [Validators.required] }),
      cycle: new FormControl(this.cycle, { validators: [Validators.required] }),
      price: new FormControl(this.price, { validators: [Validators.required] }),
      options: this.fb.array([]),
    });

    this.addOptions();
  }

  addOptions() {
    let optionsGroup: any;
    optionsGroup = this.fb.group({
      title: ['', Validators.required],
      isActive: [true, Validators.required],
    });

    this.optionsList.push(optionsGroup);
  }

  get optionsList(): FormArray {
    return this.form.get('options') as FormArray;
  }

  removeTicketClass(index: number) {
    this.optionsList.removeAt(index);
  }

  removeNullFields(obj: any): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] === null || obj[key] === undefined) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          this.removeNullFields(obj[key]);
        }
      }
    }
    return obj;
  }

  updateTitle() {
    this.title = this.form.value.title;
    this.subTitle = this.form.value.subTitle;
  }

  onSubmit() {
    if (!this.currentUser) return;

    if (this.form.invalid || !this.optionsList.valid) {
      this.form.markAllAsTouched();
      this.optionsList.markAllAsTouched();
      this.toastService.presentToast('error', 'Invalid form', '', 5000);
      return;
    }

    const raw = this.form.getRawValue();

    raw.price = +String(raw.price ?? '').replace(/\s/g, '') || 0;
    raw.currency = this.currentUser.countryId.currency || 'XAF';

    const formData = new FormData();
    Object.entries(raw).forEach(([key, value]) => {
      if (key === 'options') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any); // string/boolean/number -> stringifié par le backend si besoin
      }
    });

    // Show FormData content
    // for (const [k, v] of (formData as any).entries()) {
    //   console.log('FormData ->', k, v);
    // }

    const payload: any = {
      title: String(raw.title ?? '').trim(),
      subTitle: String(raw.subTitle ?? '').trim(),
      imageUrl: this.imageUrl,
      description: String(raw.description ?? '').trim(),
      cycle: raw.cycle,

      price: +String(raw.price ?? '').replace(/\s/g, ''),
      isActive: true,

      options: (raw.options || []).map((o: any) => ({
        title: String(o.title ?? '').trim(),
        isActive: !!(o.status ?? o.isActive),
      })),
      currency: raw.currency,
      subscriberNumber: raw.subscriberNumber ?? 0,
    };

    this.watingCreation = true;
    this.subscriptionService.createNewPlan(payload).subscribe(
      (planData) => {
        this.watingCreation = false;
        if (planData._id) {
          this.form.reset();
          this.optionsList.reset();
          this.closeModal('add_newpackage');
          this.refresh();
          this.toastService.presentToast('success', 'Done !', '', 5000);
        } else {
          console.error(planData);
          this.toastService.presentToast('error', 'Error', planData, 8000);
        }
      },
      (error) => {
        this.watingCreation = false;
        console.error(error);
      },
    );
  }

  showName(userData) {
    return this.userService.showName(userData);
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('style', 'display: none;');
    }

    document.body.classList.remove('modal-open');
    document.body.removeAttribute('style');
    document
      .querySelectorAll('.modal-backdrop')
      .forEach((backdrop) => backdrop.remove());
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  toggleActivation(planId) {
    this.wattingStatus = false;
    this.subscriptionService.changeStatus(planId).then((resp: any) => {
      this.wattingStatus = false;
      this.toastService.presentToast('success', 'Done !', '', 5000);
      this.refresh();
    });
  }

  deletePlan(planId) {
    this.subscriptionService.deletePlan(planId).then((resp: any) => {
      this.toastService.presentToast('success', 'Done !', '', 5000);
      this.closeModal('delete_modal');
      this.refresh();
    });
  }
}
