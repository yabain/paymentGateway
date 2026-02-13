import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { FlutterwaveService } from 'src/app/services/flutterwave/flutterwave.service';
import { SystemService } from 'src/app/services/system/system.service';

interface data {
  value: string;
}
@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit, OnDestroy {
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
  waitingStatus: boolean = false;
  isAdmin: boolean = false;
  isAdminRoute: boolean = false;
  activeSearch: boolean = false;
  optionsData: any = [];
  searchString: string = '';
  checkingSubscriptionStatus: boolean = true;
  isSubscriber: boolean = true;
  proceed: boolean = false;
  private destroy$ = new Subject<void>();
  private pollTimer: any;
  idParam: string | null = null;
  transactionRef: string;
  transactionData!: any;
  taxesAmount: number = 0;
  invoiceTaxes: number = 5;
  paymentWithTaxes: number = 0;

  public routes = routes;
  public selectedValue1 = '';
  public selectedValue2 = '';
  selectedList2: data[] = [{ value: 'Fixed' }, { value: 'Percentage' }];
  public toggleData = false;
  quantity: number = 1;
  estimation: number = 0;
  goToProceed: boolean = false;
  txRef: string;

  redirect_url: string = '';
  showRetry: boolean = false;
  modalClosed: boolean = false;
  reOpen: boolean = false;
  transactionSucceded: boolean = false;
  transactionFailed: boolean = false;

  openContent() {
    this.toggleData = !this.toggleData;
  }

  constructor(
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private systemService: SystemService,
    private fw: FlutterwaveService,
  ) {}

  ngOnInit(): void {
    this.getId();
    this.scrollToTop();
    this.getCurrentUser();
    this.planForm();
    this.getSystemData();
    this.transactionRef = this.paymentService.generateId();
  }

  getId() {
    const url = this.location.path();
    this.isAdminRoute = url.includes('admin-subscription');

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'null' && idParam !== 'undefined') {
      this.idParam = idParam;
    }
  }

  calculateTaxesAmount(): number {
    this.estimation = this.quantity * this.selectedPlan.price;
    return this.aroundValue(this.estimation * (this.invoiceTaxes / 100));
  }

  aroundValue(val) {
    return Math.ceil(val);
  }

  paymentWithTaxesCalculation() {
    return this.aroundValue(this.estimation + this.calculateTaxesAmount());
  }

  onQuantity(event) {
    this.quantity = Number((event.target as HTMLSelectElement).value);
    this.taxesAmount = this.calculateTaxesAmount();
    this.paymentWithTaxes = this.paymentWithTaxesCalculation();
  }

  isAuthor(plan: any, user: any = this.currentUser) {
    // console.log('plan: ', plan)
    return user._id.toString() === plan.author._id.toString() ? true : false;
  }

  selectPlan(plan: any) {
    this.selectedPlan = plan;
    this.quantity = 1;
    this.optionsData = plan ? plan.options : [];
    this.estimation = this.selectedPlan.price;
    this.taxesAmount = this.calculateTaxesAmount();
    this.paymentWithTaxes = this.paymentWithTaxesCalculation();
    // console.log('options: ', plan)
  }

  subscribe() {
    if (!this.selectedPlan) return;
    this.proceed = true;
    console.log('proceed: ', this.proceed);
    this.setTransactionData();
    console.log('transactionData: ', this.transactionData);
    setTimeout(() => {
      this.goToProceed = true;
      this.proceedSubscribe();
    }, 2000);
  }

  public searchData(value: string): void {
    if (value) {
      value = value.trim().toLowerCase();
      this.plansList = this.plansListBackup.filter(
        (plan: any) =>
          plan.title.toLowerCase().includes(value) ||
          plan.subTitle.toLowerCase().includes(value) ||
          plan.description.toLowerCase().includes(value),
      );
    } else return (this.plansList = this.plansListBackup);
  }

  filterByPrice(value: number) {
    if (value) {
      this.plansList = this.plansListBackup.filter((plan: any) =>
        plan.price.toString().toLowerCase().includes(value),
      );
    } else return (this.plansList = this.plansListBackup);
  }

  public filterByPeriod(value: string): void {
    if (value) {
      value = value.trim().toLowerCase();
      this.plansList = this.plansListBackup.filter((plan: any) =>
        plan.cycle.toLowerCase().includes(value),
      );
    } else return (this.plansList = this.plansListBackup);
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

  checkSubscriberStatus(plan) {
    this.selectPlan(plan);
    this.checkingSubscriptionStatus = true;
    this.subscriptionService
      .checkSubscriberStatus(this.selectedPlan._id)
      .then((data: any) => {
        if (data.existingSubscription && data.status) {
          this.isSubscriber = true;
        } else {
          this.isSubscriber = false;
        }
        this.checkingSubscriptionStatus = false;
      });
  }

  selectImg(imageUrl) {
    this.imageUrl = imageUrl;
  }

  toggleSearch() {
    this.activeSearch = !this.activeSearch;
    this.plansList = this.plansListBackup;
  }

  getMyPlansList() {
    this.watingPlansList = true;
    if (this.isAdmin) {
      this.subscriptionService.getAllPlansList().subscribe((data: any) => {
        this.watingPlansList = false;
        this.plansList = data;
        this.plansListBackup = data;
        console.log('plansListBackup geted: ', this.plansListBackup);
      });
    } else {
      this.subscriptionService
        .getMyPlansList(this.currentUser._id)
        .subscribe((data: any) => {
          this.watingPlansList = false;
          this.plansList = data;
          this.plansListBackup = data;
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
      if (!user) return console.log('No user');
      this.currentUser = user;
      // console.log('current user: ', user)
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

  verifytransactionData(transactionData): boolean {
    if (transactionData.payment < 100) {
      return false;
    }
    return true;
  }

  async proceedSubscribe() {
    if (!this.verifytransactionData(this.transactionData)) return;
    this.proceed = true;
    await this.fw.loadFlutterwaveScript();
    this.paymentService
      .proceedPayment(this.transactionData)
      .subscribe((res: any) => {
        if (!res) {
          this.proceed = false;
          this.toastService.presentToast('error', 'Error', res.message);
        } else {
          this.txRef = res.txRef;
          this.redirect_url = res.redirect_url;
          this.handleRequest();
        }
      });
  }

  openModal() {
    this.showRetry = false;
    setTimeout(() => {
      this.showRetry = true;
      this.reOpen = false;
    }, 10000);
    this.startPolling();
    return window.open(this.redirect_url, '_blank', 'width=800,height=800');
  }

  startPolling() {
    if (!this.txRef) return;
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.transactionSucceded = false;
    this.transactionFailed = false;

    this.pollTimer = setInterval(async () => {
      try {
        this.paymentService
          .getPayinByTxRef(this.txRef)
          .subscribe((resp: any) => {
            this.handlePayinStatus(resp);
          });
      } catch (err) {
        console.warn('polling error', err);
      }
    }, 5 * 1000);
  }

  handleRequest() {
    if (this.redirect_url) {
      const payWin = this.openModal();
      if (!payWin) {
        location.href = this.redirect_url;
        return;
      }

      // monitor the closure and do a server-side check
      const timer = setInterval(async () => {
        if (payWin.closed) {
          clearInterval(timer);
          // small check to update the UI (statut PENDING/ABANDONED)
          this.paymentService
            .getPayinByTxRef(this.txRef)
            .subscribe((resp: any) => {
              this.handlePayinStatus(resp);
            });
          try {
            this.modalClosed = true;
            // this.verifyAndClosePayin();
          } catch {}
          // TODO: display a "payment canceled" message or refresh the status
        }
      }, 600);
    } else {
      this.toastService.presentToast('error', 'Error', '');
    }
  }

  handlePayinStatus(resp: any) {
    const status =
      resp?.data?.data?.status ||
      resp?.data?.status ||
      resp?.status ||
      'pending';
    console.log('resp: ', resp);
    console.log('status: ', status);
    if (['successful', 'success'].includes(status.toLowerCase())) {
      this.transactionSucceded = true;
      this.transactionFailed = false;
      clearInterval(this.pollTimer);
    }
    if (['cancelled'].includes(status.toLowerCase())) {
      this.transactionSucceded = false;
      this.transactionFailed = true;
      // clearInterval(this.pollTimer);
    }
    if (['failed'].includes(status.toLowerCase())) {
      this.transactionSucceded = false;
      this.transactionFailed = true;
      // clearInterval(this.pollTimer);
    }
  }

  openPayin() {
    this.reOpen = true;
    this.transactionSucceded = false;
    this.transactionFailed = false;
    this.paymentService.openPayin(this.txRef).subscribe((res: any) => {
      if (res && res.status === 'pending') {
        return this.handleRequest();
      }
      return this.toastService.presentToast('error', 'Error', '');
    });
  }

  verifyAndClosePayin() {
    this.paymentService
      .verifyAndClosePayin(this.txRef)
      .subscribe((res: any) => {
        if (res) {
          if (res.status === 'successful' || res.status === 'success') {
            this.transactionSucceded = true;
            this.transactionFailed = false;
          } else if (res.status === 'failed') {
            this.transactionSucceded = false;
            this.transactionFailed = true;
          } else {
            this.transactionSucceded = false;
            this.transactionFailed = false;
          }
        } else {
          this.toastService.presentToast('error', 'Error', res.message);
        }
      });
  }

  getSystemData() {
    this.systemService.getSystemData().subscribe((resp: any) => {
      this.invoiceTaxes = resp ? resp.invoiceTaxes : 0;
    });
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
    this.waitingStatus = false;
    this.subscriptionService.changeStatus(planId).then((resp: any) => {
      this.waitingStatus = false;
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

  navigateTo(route) {
    this.ngOnDestroy();
    this.router.navigate([route]);
  }

  setTransactionData() {
    this.transactionData = {
      transactionRef: this.transactionRef,
      estimation: this.estimation,
      invoiceTaxes: this.invoiceTaxes,
      taxesAmount: this.calculateTaxesAmount(),
      paymentWithTaxes: this.paymentWithTaxesCalculation(),

      senderId: this.currentUser._id,
      senderName: this.showName(this.currentUser),
      senderEmail: this.currentUser.email,
      senderContact: this.currentUser.phone,
      senderCountry: this.currentUser.countryId.name,
      senderCurrency: this.selectedPlan.currency,

      raisonForTransfer: this.paymentService.transactionType.SUBSCRIPTION,
      userId: this.currentUser._id,

      receiverName: this.showName(this.selectedPlan.author),
      receiverEmail: this.selectedPlan.author.email,
      receiverContact: this.selectedPlan.author.phone,
      cycle: this.selectedPlan.cycle,
      planId: this.selectedPlan._id,
      receiverCurrency: this.selectedPlan.currency,
      quantity: this.quantity,
      receiverAmount: this.getCleanAmount(),

      receiverId: this.selectedPlan.author._id,

      status: this.paymentService.status.PAYINPENDING,
      transactionType: this.paymentService.transactionType.SUBSCRIPTION,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.pollTimer);
    this.proceed = false;
    this.goToProceed = false;
    this.showRetry = false;
    this.reOpen = false;
    this.transactionSucceded = false;
    this.transactionFailed = false;
    this.modalClosed = false;
    this.transactionData = null;
    this.txRef = '';
    this.redirect_url = '';
    this.selectedPlan = null;
    this.optionsData = [];
    this.searchString = '';
    this.checkingSubscriptionStatus = true;
  }
}
