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
import { StorageService } from 'src/app/services/storage/storage.service';
import { environment } from 'src/environments/environment';

interface data {
  value: string;
}
@Component({
  selector: 'app-package-details',
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.scss'],
})
export class PackageDetailsComponent implements OnInit, OnDestroy {
  loadingData: boolean = true;
  subscriptionStatus: any;
  currentUser!: any;
  isDashboardRoute: boolean = false;

  // statistics!: any;
  title: string = '';
  subTitle: string = '';
  imageUrl: string = 'assets/img/ressorces/package_img.png';
  cycle: string = 'monthly'; // yearly | monthly | weekly | dayly
  description: string = '';
  isActive: boolean = true;
  price: string = '0';
  currency: string = '';
  subscriberNumber: number = 0;
  planData!: any;
  options: any;
  form: FormGroup;
  watingCreation: boolean = false;
  wattingStatus: boolean = false;
  isAdmin: boolean = false;
  optionsData: any = [];
  checkingSubscriptionStatus: boolean = true;
  isSubscriber: boolean = true;
  proceed: boolean = false;
  private destroy$ = new Subject<void>();
  private pollTimer: any;
  idParam: string | null = null;
  userId: string | null = null;
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
  watingCurrentUser: boolean = false;
  url: string = '';
  copied = false;

  // futureDate: Date = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000);
  futureDate: Date = new Date();
  private intervalId: any;

  days: number = 0;
  months: number = 0; // ⚠️ often we calculate in days/hours/minutes/seconds only
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  gettingSubscribers: boolean = true;
  subscribers: any[] = [];

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
    private storage: StorageService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((datas: any) => {
      // this.startCountdown(this.futureDate);
      this.scrollToTop();
      this.refresh(true);
    });
  }


  startCountdown(targetDate: Date) {
    this.updateCountdown(targetDate); // première maj directe

    this.intervalId = setInterval(() => {
      this.updateCountdown(targetDate);
    }, 1000);
  }

  private updateCountdown(targetDate: Date) {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
      this.days = this.hours = this.minutes = this.seconds = 0;
      clearInterval(this.intervalId);
      return;
    }

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }

  getSubscribersList() {
    this.gettingSubscribers = true;
    this.subscriptionService
      .getSubscribersList(this.planData._id)
      .subscribe((data: any) => {
        this.subscribers = data;
        console.log('subscribers', this.subscribers);
        this.gettingSubscribers = false;
      });
  }

  public getDate(date: string) {
    return date.split('T')[0];
  }

  getId() {
    
    this.url = this.location.path();
    this.isDashboardRoute = this.url.includes('subscription');

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'null' && idParam !== 'undefined') {
     [this.idParam, this.userId] = idParam.split('AAA');
    }
    console.log('idParam', this.idParam);
    console.log('userId', this.userId);
    this.getPlanDataById(this.idParam);
  }
  
  getUserData(userId) {
     this.userService.getUser(userId)
         .subscribe((user)=> {
            if (user) {
               this.currentUser = user;
               this.checkSbscriberStatus(this.planData);
               this.loadingData = false;
            }
          
      })
  }

  showName(userData) {
    return this.userService.showName(userData);
  }

  getPlanDataById(planId: string) {
    this.subscriptionService.getMyPlansData(planId).subscribe((data: any) => {
      if (!data) {
        return this.navigateTo('/');
      }
      this.planData = data;
      this.optionsData = data.options;
      this.quantity = 1;
      this.taxesAmount = this.calculateTaxesAmount();
      this.paymentWithTaxes = this.paymentWithTaxesCalculation();

      if (this.userId) {
          this.getUserData(this.userId);
      } else {
        this.getCurrentUser();
        this.loadingData = false;
      }
    });
  }

  isAuthor(plan: any, user: any = this.currentUser) {
    return user?._id.toString() === plan?.author._id.toString() ? true : false;
  }

  subscribe() {
    if (!this.planData) return;
    this.proceed = true;
    this.setTransactionData();
    setTimeout(() => {
      this.goToProceed = true;
      this.proceedSubscribe();
    }, 2000);
  }

  checkSbscriberStatus(plan) {
    this.checkingSubscriptionStatus = true;
    if (!this.currentUser) {
      this.isSubscriber = false;
      this.checkingSubscriptionStatus = false;
    }
    console.log('plan', plan)
    console.log('currentUser: ', this.currentUser);

    this.subscriptionService
      .checkSbscriberStatus(this.planData._id, this.currentUser._id || undefined)
      .then((data: any) => {
        this.subscriptionStatus = data;
        if (data.existingSubscription) {
          this.isSubscriber = true;
          if (data.status) {
            this.futureDate = new Date(data.endDate);
            this.startCountdown(this.futureDate);
          }
        } else {
          this.isSubscriber = false;
        }
        this.checkingSubscriptionStatus = false;
      });
  }

  getCurrentUser() {
    this.watingCurrentUser = true;
    this.userService.getCurrentUser().then((user: any) => {
      if (!user) return (this.watingCurrentUser = false);
      this.currentUser = user;
      this.checkSbscriberStatus(this.planData);
      if (
        this.currentUser.admin ||
        this.currentUser._id == this.planData.receiverId
      ) {
        this.planForm(this.planData);
      }
      this.isAuthor(this.planData);
      if (user.isAdmin) this.isAdmin = true;
      this.currency = this.planData.currency;
      if (this.isAuthor(this.planData) || this.isAdmin) {
        this.getSubscribersList();
      }

      if (!this.isDashboardRoute && this.currentUser) {
        const newUrl = this.url.replace(
          '/package-details',
          '/subscription/details',
        );
        this.navigateTo(newUrl);
      }

      return (this.watingCurrentUser = true);
    });
  }

  aroundValue(val) {
    return Math.ceil(val);
  }

  paymentWithTaxesCalculation() {
    return this.aroundValue(this.estimation + this.calculateTaxesAmount());
  }

  selectImg(imageUrl) {
    this.imageUrl = imageUrl;
  }

  calculateTaxesAmount(): number {
    this.estimation = this.quantity * this.planData.price;
    return this.aroundValue(this.estimation * (this.invoiceTaxes / 100));
  }

  refresh(reload: boolean = false) {
    if (reload) this.loadingData = true;
    this.getId();
    this.transactionRef = this.paymentService.generateId();
  }

  formatAmount(value: any) {
    value = value.replace(/\D/g, '');

    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    this.price = value;
  }

  getCleanAmount(): number {
    const cleanValue = this.price.replace(/\s/g, '');
    return parseFloat(cleanValue) || 0;
  }

  planForm(data?) {
    this.form = new FormGroup({
      title: new FormControl(data?.title || this.title, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      imageUrl: new FormControl(data?.imageUrl || this.imageUrl),
      isActive: new FormControl(data?.isActive || true),
      currency: new FormControl(data?.currency || ''),
      subscriberNumber: new FormControl(0),
      subTitle: new FormControl(data?.subTitle || '', {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      description: new FormControl(data?.description || '', {
        validators: [Validators.required],
      }),
      cycle: new FormControl(data?.cycle || this.cycle, {
        validators: [Validators.required],
      }),
      price: new FormControl(data?.price || this.price, {
        validators: [Validators.required],
      }),
      options: this.fb.array(data?.options || []),
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
    raw.currency = this.planData.currency || 'XAF';

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
    if (['successful', 'success'].includes(status.toLowerCase())) {
      this.transactionSucceded = true;
      this.transactionFailed = false;
      clearInterval(this.pollTimer);
      this.refresh();
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
      this.navigateTo('/subscription/packages');
    });
  }

  onQuantity(event) {
    this.quantity = Number((event.target as HTMLSelectElement).value);
    this.taxesAmount = this.calculateTaxesAmount();
    this.paymentWithTaxes = this.paymentWithTaxesCalculation();
  }

  navigateTo(route) {
    if (!this.currentUser && route === '/auth/login') {
      this.storage.setStorage(environment.memory_link, this.url);
    }
    this.ngOnDestroy();
    this.router.navigate([route]);
  }

  setTransactionData() {
    this.transactionData = {
      transactionRef: this.transactionRef,
      estimation: this.estimation,
      invoiceTaxes: this.invoiceTaxes,
      taxesAmount: this.planData.taxesAmount,
      paymentWithTaxes: this.paymentWithTaxesCalculation(),

      senderId: this.currentUser._id,
      senderName: this.showName(this.currentUser),
      senderEmail: this.currentUser.email,
      senderContact: this.currentUser.phone,
      senderCountry: this.currentUser.countryId.name,
      senderCurrency: this.planData.currency,

      raisonForTransfer: this.paymentService.transactionType.SUBSCRIPTION,
      userId: this.currentUser._id,

      receiverName: this.showName(this.planData.author),
      receiverEmail: this.planData.author.email,
      receiverContact: this.planData.author.phone,
      cycle: this.planData.cycle,
      planId: this.planData._id,
      receiverCurrency: this.planData.currency,
      quantity: this.quantity,
      receiverAmount: this.planData.price,

      receiverId: this.planData.author._id,

      status: this.paymentService.status.PAYINPENDING,
      transactionType: this.paymentService.transactionType.SUBSCRIPTION,
    };
  }

  copyUrl() {
    const url = environment.frontUrl + '/package-details/' + this.idParam;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;

      // Réinitialise le message après 2 secondes
      this.toastService.presentToast('success', 'Copied !', '', 5000);
      setTimeout(() => this.copied = false, 2000);
    }).catch(err => {
      console.error('Impossible de copier : ', err);
    });
  }

  createSubscriptionItem(){
  }

  openSubscription(subscription, subscriberId){
    console.log('openSubscription', subscription, subscriberId);
    return this.navigateTo('/subscription/subscription-details/' + subscription + '&&' + subscriberId);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
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
    // this.transactionData = null;
    // this.txRef = '';
    // this.redirect_url = '';
    // this.planData = null;
    // this.optionsData = [];
    // this.checkingSubscriptionStatus = true;
  }
}
