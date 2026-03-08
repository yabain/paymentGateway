import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { FundraisingService } from 'src/app/services/fundraising/fundraising.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-fundraising-details',
  templateUrl: './fundraising-details.component.html',
  styleUrls: ['./fundraising-details.component.scss'],
})
export class FundraisingDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  updating = false;
  donating = false;

  fundraisingId = '';
  donationId = '';

  fundraisingData: any = null;
  donationStats: any = null;
  donations: any[] = [];
  donationDetails: any = null;

  isAdminRoute = false;

  editForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    targetAmount: new FormControl(0, [Validators.required, Validators.min(1)]),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    visibility: new FormControl('public', [Validators.required]),
  });

  donateForm = new FormGroup({
    amount: new FormControl(0, [Validators.required, Validators.min(1)]),
    message: new FormControl(''),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fundraisingService: FundraisingService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.isAdminRoute = this.location.path().includes('admin-fundraising');
      this.fundraisingId = params.get('id') || '';
      this.donationId = params.get('donationId') || '';

      if (this.donationId) {
        this.loadDonationDetails(this.donationId);
        return;
      }

      if (this.fundraisingId) {
        this.loadFundraising();
      }
    });
  }

  loadFundraising(): void {
    this.loading = true;

    this.fundraisingService
      .getFundraisingById(this.fundraisingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (!data) {
          this.loading = false;
          this.navigateBack();
          return;
        }

        this.fundraisingData = data;
        this.patchFormWithData();
        this.loadDonationStats();
        this.loadDonations();
      });
  }

  patchFormWithData(): void {
    this.editForm.patchValue({
      title: this.fundraisingData?.title || '',
      description: this.fundraisingData?.description || '',
      targetAmount: this.fundraisingData?.targetAmount || this.fundraisingData?.targetAmount || 0,
      startDate: this.formatDateInput(this.fundraisingData?.startDate),
      endDate: this.formatDateInput(this.fundraisingData?.endDate),
      visibility: this.fundraisingData?.visibility || 'public',
    });
  }

  formatDateInput(value: string): string {
    if (!value) {
      return '';
    }
    return String(value).split('T')[0];
  }

  loadDonationStats(): void {
    this.fundraisingService
      .getFundraisingDonationStats(this.fundraisingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats: any) => {
        this.donationStats = stats;
      });
  }

  loadDonations(): void {
    this.fundraisingService
      .getFundraisingDonations(this.fundraisingId, { page: 1, limit: 20 })
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (Array.isArray(response)) {
          this.donations = response;
        } else {
          this.donations = response?.docs || response?.items || response?.data || [];
        }
        this.loading = false;
      });
  }

  updateFundraising(): void {
    if (this.editForm.invalid || !this.fundraisingId) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.updating = true;
    const payload = this.removeEmpty(this.editForm.value);

    this.fundraisingService
      .updateFundraising(this.fundraisingId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.updating = false;
        if (res?.error) {
          this.toastService.presentToast('error', 'Error', 'Operation failed');
          return;
        }

        this.toastService.presentToast('success', 'Success', 'Fundraising updated');
        this.loadFundraising();
      });
  }

  toggleStatus(): void {
    if (!this.fundraisingId) {
      return;
    }

    const current = this.fundraisingData?.isActive ?? this.fundraisingData?.status ?? false;

    this.fundraisingService
      .updateStatus(this.fundraisingId, !Boolean(current))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toastService.presentToast('success', 'Success', 'Status updated');
        this.loadFundraising();
      });
  }

  toggleVisibility(): void {
    if (!this.fundraisingId) {
      return;
    }

    const visibility = this.fundraisingData?.visibility === 'private' ? 'public' : 'private';

    this.fundraisingService
      .updateVisibility(this.fundraisingId, visibility)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toastService.presentToast('success', 'Success', 'Visibility updated');
        this.loadFundraising();
      });
  }

  donate(): void {
    if (this.donateForm.invalid || !this.fundraisingId) {
      this.donateForm.markAllAsTouched();
      return;
    }

    this.donating = true;

    this.fundraisingService
      .donate(this.fundraisingId, this.removeEmpty(this.donateForm.value))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.donating = false;

        if (res?.error) {
          this.toastService.presentToast('error', 'Error', 'Unable to initialize donation');
          return;
        }

        this.toastService.presentToast('success', 'Success', 'Donation initialized');

        const checkoutUrl =
          res?.link ||
          res?.url ||
          res?.redirect_url ||
          res?.data?.link ||
          res?.data?.url ||
          res?.data?.redirect_url;

        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank');
        }

        this.loadDonations();
        this.loadDonationStats();
      });
  }

  showDonationDetails(donation: any): void {
    if (!donation?._id) {
      return;
    }

    const prefix = this.isAdminRoute ? '/admin-fundraising' : '/fundraising';
    this.router.navigate([`${prefix}/donations/${donation._id}`]);
  }

  loadDonationDetails(donationId: string): void {
    this.loading = true;
    this.fundraisingService
      .getDonationDetails(donationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.donationDetails = data;
        this.loading = false;
      });
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

  navigateBack(): void {
    const prefix = this.isAdminRoute ? '/admin-fundraising' : '/fundraising';
    const fallback = this.isAdminRoute ? `${prefix}/list` : `${prefix}/my/list`;
    this.router.navigate([fallback]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
