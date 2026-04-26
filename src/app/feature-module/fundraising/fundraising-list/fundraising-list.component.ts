import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FieldValidationService } from 'src/app/services/field-validation/field-validation.service';
import { FundraisingService } from 'src/app/services/fundraising/fundraising.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

type CampaignFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-fundraising-list',
  templateUrl: './fundraising-list.component.html',
  styleUrls: ['./fundraising-list.component.scss'],
})
export class FundraisingListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  creating = false;
  waitingAction = false;
  showCreateForm = false;

  campaigns: any[] = [];
  currentUser: any = null;
  isAdminRoute = false;

  page = 1;
  limit = 50;
  totalItems = 0;
  hasNextPage = false;
  hasPrevPage = false;

  contextPath = '';
  form: FormGroup;

  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  selectedCategory: CampaignFilter = 'all';
  showFilters = false;

  categories: Array<{ id: CampaignFilter; name: string; value: number }> = [
    { id: 'all', name: 'totalFundraising', value: 0 },
    { id: 'active', name: 'activeFundraising', value: 0 },
    { id: 'inactive', name: 'inactiveFundraising', value: 0 },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fundraisingService: FundraisingService,
    private userService: UserService,
    private toastService: ToastService,
    private fieldValidationService: FieldValidationService,
  ) {}

  ngOnInit(): void {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(async () => {
      this.contextPath = this.route.snapshot.routeConfig?.path || '';
      this.isAdminRoute = this.location.path().includes('admin-fundraising');
      await this.loadCurrentUser();
      this.initForm();
      this.loadList(1);
    });
  }

  async loadCurrentUser(): Promise<void> {
    this.currentUser = await this.userService.getCurrentUser();
  }

  initForm(): void {
    const defaultCurrency = this.currentUser?.countryId?.currency || 'XAF';
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(3)]),
      subTitle: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      currency: new FormControl(defaultCurrency, [Validators.required]),
      targetAmount: new FormControl(0, [
        Validators.required,
        this.fieldValidationService.currencyAmountValidator(
          () => this.form?.value?.currency || this.currentUser?.countryId?.currency || 'XAF',
        ),
      ]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      status: new FormControl(true, [Validators.required]),
      visibility: new FormControl('public', [Validators.required]),
      coverImageUrl: new FormControl(
        'https://payments.digikuntz.com/assets/img/icons/price-01.svg',
        [Validators.required],
      ),
    });

    this.form
      .get('currency')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.form.get('targetAmount')?.updateValueAndValidity());
  }

  loadList(page = this.page): void {
    this.page = page;
    this.loading = true;

    const query = { page: this.page, limit: this.limit };
    const request$ = this.getRequestByContext(query);

    request$.pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      const normalized = this.normalizePaginatedData(response);
      this.campaigns = normalized.items.map((campaign: any) => ({
        ...campaign,
        status: this.getCampaignIsActive(campaign),
      }));
      this.totalItems = normalized.total;
      this.hasNextPage = normalized.hasNextPage;
      this.hasPrevPage = normalized.hasPrevPage;
      this.updateCategoryCounts();
      this.loading = false;
    });
  }

  getRequestByContext(query: any) {
    if (this.contextPath === 'my/active') {
      return this.fundraisingService.getMyActiveFundraisings(query);
    }
    if (this.contextPath === '' || this.contextPath === 'list' || this.contextPath === 'my/list') {
      return this.isAdminRoute
        ? this.fundraisingService.getAllSystem(query)
        : this.fundraisingService.getMyFundraisings(query);
    }

    const userId = this.route.snapshot.paramMap.get('userId');
    if (this.contextPath === 'user/:userId/list' && userId) {
      return this.fundraisingService.getUserFundraisings(userId, query);
    }
    if (this.contextPath === 'user/:userId/active' && userId) {
      return this.fundraisingService.getUserActiveFundraisings(userId, query);
    }
    if (this.contextPath === 'user/:userId/active-public' && userId) {
      return this.fundraisingService.getUserActivePublicFundraisings(userId, query);
    }

    return this.fundraisingService.getMyFundraisings(query);
  }

  normalizePaginatedData(response: any): {
    items: any[];
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    if (Array.isArray(response)) {
      return {
        items: response,
        total: response.length,
        hasNextPage: false,
        hasPrevPage: this.page > 1,
      };
    }

    const items = response?.docs || response?.items || response?.data || [];
    const total = response?.totalDocs || response?.total || items.length;

    return {
      items,
      total,
      hasNextPage: response?.hasNextPage || this.page * this.limit < total,
      hasPrevPage: response?.hasPrevPage || this.page > 1,
    };
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.form.reset({
      title: '',
      subTitle: '',
      description: '',
      currency: this.currentUser?.countryId?.currency || 'XAF',
      targetAmount: 0,
      startDate: '',
      endDate: '',
      status: true,
      visibility: 'public',
      coverImageUrl: 'https://payments.digikuntz.com/assets/img/icons/price-01.svg',
    });
  }

  createCampaign(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currency = this.form.value.currency || this.currentUser?.countryId?.currency || 'XAF';
    const targetAmount = this.fieldValidationService.parseAmount(this.form.value.targetAmount);
    if (!this.fieldValidationService.isValidAmount(targetAmount, currency)) {
      this.toastService.presentToast(
        'error',
        'Error',
        `Montant invalide (${this.fieldValidationService.getRangeMessage(currency)})`,
      );
      return;
    }

    this.creating = true;
    this.fundraisingService
      .createFundraising(this.removeEmpty(this.form.value))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.creating = false;
        if (res?.error) {
          this.toastService.presentToast('error', 'Error', 'Operation failed');
          return;
        }

        this.toastService.presentToast('success', 'Success', 'Operation completed');
        this.showCreateForm = false;
        document.getElementById('close-add-fundraising')?.click();
        this.loadList(1);
      });
  }

  refresh(): void {
    this.loadList(this.page);
  }

  get activeCount(): number {
    return (this.campaigns || []).filter((campaign) => this.getCampaignIsActive(campaign)).length;
  }

  get inactiveCount(): number {
    return Math.max((this.campaigns || []).length - this.activeCount, 0);
  }

  setCategoryFilter(category: CampaignFilter): void {
    this.selectedCategory = category;
  }

  get filteredCampaigns(): any[] {
    return (this.campaigns || []).filter((campaign) => {
      const query = this.searchQuery.trim().toLowerCase();
      const title = String(campaign?.title || '').toLowerCase();
      const description = String(campaign?.description || '').toLowerCase();
      const matchesSearch = !query || title.includes(query) || description.includes(query);

      const isActive = this.getCampaignIsActive(campaign);
      const matchesCategory =
        this.selectedCategory === 'all' ||
        (this.selectedCategory === 'active' && isActive) ||
        (this.selectedCategory === 'inactive' && !isActive);

      return matchesSearch && matchesCategory;
    });
  }

  toggleView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  goToDetails(campaign: any): void {
    if (!campaign?._id) {
      return;
    }
    const prefix = this.isAdminRoute ? '/admin-fundraising' : '/fundraising';
    this.router.navigate([`${prefix}/${campaign._id}`]);
  }

  changeStatus(campaign: any): void {
    if (!campaign?._id) {
      return;
    }

    const current = this.getCampaignIsActive(campaign);
    this.waitingAction = true;

    this.fundraisingService
      .updateStatus(campaign._id, !current)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.waitingAction = false;
        this.toastService.presentToast('success', 'Success', 'Status updated');
        this.loadList(this.page);
      });
  }

  changeVisibility(campaign: any): void {
    if (!campaign?._id) {
      return;
    }

    const visibility = campaign?.visibility === 'private' ? 'public' : 'private';
    this.waitingAction = true;

    this.fundraisingService
      .updateVisibility(campaign._id, visibility)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.waitingAction = false;
        this.toastService.presentToast('success', 'Success', 'Visibility updated');
        this.loadList(this.page);
      });
  }

  private getCampaignIsActive(campaign: any): boolean {
    return Boolean(campaign?.isActive ?? campaign?.status);
  }

  private updateCategoryCounts(): void {
    const total = (this.campaigns || []).length;
    const active = this.activeCount;
    const inactive = Math.max(total - active, 0);

    this.categories = this.categories.map((cat) => {
      if (cat.id === 'all') return { ...cat, value: total };
      if (cat.id === 'active') return { ...cat, value: active };
      return { ...cat, value: inactive };
    });
  }

  private removeEmpty(payload: any): any {
    const result: any = {};
    Object.keys(payload || {}).forEach((key) => {
      const value = payload[key];
      if (value !== undefined && value !== null && value !== '') {
        result[key] = value;
      }
    });
    return result;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
