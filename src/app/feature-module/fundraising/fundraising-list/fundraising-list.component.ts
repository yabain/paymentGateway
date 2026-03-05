import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { FundraisingService } from 'src/app/services/fundraising/fundraising.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

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
  selectedUserDonationStats: any = null;
  totalDonationsData: any = null;

  currentUser: any = null;
  isAdminRoute = false;

  page = 1;
  limit = 10;
  totalItems = 0;
  hasNextPage = false;
  hasPrevPage = false;

  contextPath = '';
  selectedUserId = '';

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    subTitle: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    currency: new FormControl('XAF', [Validators.required]),
    targetAmount: new FormControl(0, [Validators.required, Validators.min(1000)]),
    endDate: new FormControl('', [Validators.required]),
    status: new FormControl(true, [Validators.required]),
    visibility: new FormControl('public', [Validators.required]),
    coverImageUrl: new FormControl('https://cdn.example.com/fundraising/cover.jpg', [Validators.required]),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fundraisingService: FundraisingService,
    private userService: UserService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(async () => {
      this.contextPath = this.route.snapshot.routeConfig?.path || '';
      this.isAdminRoute = this.location.path().includes('admin-fundraising');
      await this.loadCurrentUser();
      this.applyDefaultCurrency();
      this.loadList();
      this.loadAdminStats();
    });
  }

  async loadCurrentUser(): Promise<void> {
    this.currentUser = await this.userService.getCurrentUser();
    if (this.currentUser && this.selectedUserId === '') {
      this.selectedUserId = this.currentUser._id;
    }
  }

  applyDefaultCurrency(): void {
    const currency = this.currentUser?.countryId?.currency || 'XAF';
    if (!this.form.value.currency) {
      this.form.patchValue({ currency });
    }
  }

  loadAdminStats(): void {
    if (!this.isAdminRoute) {
      return;
    }

    this.fundraisingService
      .getTotalDonations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.totalDonationsData = data;
      });
  }

  loadList(page = this.page): void {
    this.page = page;
    this.loading = true;

    const query = { page: this.page, limit: this.limit };
    const userId = this.route.snapshot.paramMap.get('userId') || this.selectedUserId;
    const request$ = this.getRequestByContext(query, userId);

    request$.pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      const normalized = this.normalizePaginatedData(response);
      this.campaigns = normalized.items;
      this.totalItems = normalized.total;
      this.hasNextPage = normalized.hasNextPage;
      this.hasPrevPage = normalized.hasPrevPage;
      this.loading = false;
    });
  }

  getRequestByContext(query: any, userId: string) {
    if (this.contextPath === 'my/active') {
      return this.fundraisingService.getMyActiveFundraisings(query);
    }

    if (this.contextPath === 'my/list') {
      return this.fundraisingService.getMyFundraisings(query);
    }

    if (this.contextPath === '') {
      return this.isAdminRoute
        ? this.fundraisingService.getAllSystem(query)
        : this.fundraisingService.getMyFundraisings(query);
    }

    if (this.contextPath === 'list') {
      return this.isAdminRoute
        ? this.fundraisingService.getAllSystem(query)
        : this.fundraisingService.getMyFundraisings(query);
    }

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
    this.showCreateForm = !this.showCreateForm;
  }

  createCampaign(): void {
    console.log('form data: ', this.form.value);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.creating = true;
    const payload = this.removeEmpty(this.form.value);

    this.fundraisingService
      .createFundraising(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.creating = false;
        if (res?.error) {
          this.toastService.presentToast('error', 'Error', 'Operation failed');
          return;
        }

        this.toastService.presentToast('success', 'Success', 'Operation completed');
        this.showCreateForm = false;
        this.form.reset({
          currency: this.currentUser?.countryId?.currency || 'XAF',
          visibility: 'public',
        });
        this.loadList(1);
      });
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

    const current = campaign?.isActive ?? campaign?.status ?? false;
    this.waitingAction = true;

    this.fundraisingService
      .updateStatus(campaign._id, !Boolean(current))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.waitingAction = false;
        this.toastService.presentToast('success', 'Success', 'Status updated');
        this.loadList();
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
        this.loadList();
      });
  }

  viewUserDonationStats(): void {
    if (!this.selectedUserId) {
      return;
    }

    this.fundraisingService
      .getUserDonationStats(this.selectedUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.selectedUserDonationStats = data;
      });
  }

  openUserList(type: 'list' | 'active' | 'active-public'): void {
    if (!this.selectedUserId) {
      return;
    }

    const prefix = this.isAdminRoute ? '/admin-fundraising' : '/fundraising';
    this.router.navigate([`${prefix}/user/${this.selectedUserId}/${type}`]);
  }

  previousPage(): void {
    if (!this.hasPrevPage) {
      return;
    }
    this.loadList(this.page - 1);
  }

  nextPage(): void {
    if (!this.hasNextPage) {
      return;
    }
    this.loadList(this.page + 1);
  }

  trackById(_index: number, item: any): string {
    return item?._id || String(_index);
  }

  removeEmpty(payload: any): any {
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
