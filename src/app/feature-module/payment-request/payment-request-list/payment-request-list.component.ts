import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaymentRequestService } from 'src/app/services/payment-request/payment-request.service';
import { PaymentRequestItem } from 'src/app/services/payment-request/payment-request.types';
import { PrintService } from 'src/app/services/print/print.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-payment-request-list',
  templateUrl: './payment-request-list.component.html',
  styleUrls: ['./payment-request-list.component.scss'],
})
export class PaymentRequestListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  printing: boolean = false;

  currentUser: any;
  isAdminRoute = false;
  loading = true;
  refreshing = false;

  items: PaymentRequestItem[] = [];
  selectedItem: PaymentRequestItem | null = null;

  page = 1;
  limit = 15;
  totalItems = 0;
  hasNextPage = false;
  hasPrevPage = false;

  constructor(
    private paymentRequestService: PaymentRequestService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private location: Location,
    private pdfExportService: PrintService,
  ) {}

  ngOnInit(): void {
    this.isAdminRoute = this.location.path().includes('admin-payment-request');
    this.loadCurrentUser();
    this.loadList();
  }

  async loadCurrentUser(): Promise<void> {
    this.currentUser = await this.userService.getCurrentUser();
    console.log('currentUser: ', this.currentUser);
  }

  loadList(page: number = this.page): void {
    this.page = page;
    this.loading = true;

    const query = { page: this.page, limit: this.limit };
    const request$ = this.isAdminRoute
      ? this.paymentRequestService.getAllSystemPaymentRequests(query)
      : this.paymentRequestService.getMyPaymentRequests(query);

    request$.pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      const data = Array.isArray(response?.data) ? response.data : [];
      this.items = [...data].sort((a: any, b: any) => {
        const aDate = new Date(a?.createdAt || 0).getTime();
        const bDate = new Date(b?.createdAt || 0).getTime();
        return bDate - aDate;
      });
      console.log('items: ', this.items)

      const pagination = response?.pagination || {};
      this.totalItems = Number(pagination?.totalItems || this.items.length);
      this.hasNextPage = Boolean(pagination?.hasNextPage);
      this.hasPrevPage = this.page > 1;
      this.loading = false;
      this.refreshing = false;
    });
  }

  refresh(): void {
    this.refreshing = true;
    this.loadList(this.page);
  }

  previousPage(): void {
    if (!this.hasPrevPage) return;
    this.loadList(this.page - 1);
  }

  nextPage(): void {
    if (!this.hasNextPage) return;
    this.loadList(this.page + 1);
  }

  openDetails(item: PaymentRequestItem): void {
    this.selectedItem = item;
    console.log(this.selectedItem);
  }

  onDetailsModalClose(event?: Event): void {
    const target = event?.target as HTMLElement | null;
    target?.blur();
    (document.activeElement as HTMLElement | null)?.blur?.();
  }

  goToCreate(): void {
    if (this.isAdminRoute) {
      this.toastService.presentToast('warning', 'Warning', 'Action not allowed');
      return;
    }
    this.router.navigate(['/payment-request/create']);
  }

  statusBadgeClass(status?: string): string {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'success') return 'bg-success';
    if (normalized === 'pending') return 'bg-warning';
    if (normalized === 'failed' || normalized === 'canceled') return 'bg-danger';
    return 'bg-secondary';
  }

  formatUserLabel(item: any): string {
    const user = item?.userId;
    if (!user) return '--';
    if (user?.accountType === 'personal') {
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '--';
    }
    return user?.name || user?.email || '--';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public exportToPdf(item): void {
    this.selectedItem = item;
    // console.log('exportation de pdf');
    if (this.selectedItem) {
      this.toastService.presentToast('info', 'Download', 'Téléchargement en cours...');
      // this.toastService.info("Téléchargement en cours...", "PDF", {
      //   timeOut: 10000,
      //   closeButton: true,
      // });
      this.printing = true;
      setTimeout(() => {
        this.pdfExportService.generatePdf(
          'receipt',
          'Recu_' + this.selectedItem._id + '.pdf',
          210,
          297,
          true,
        );
      }, 1 * 1000);
      setTimeout(() => {
        this.printing = false;
      }, 5 * 1000);
    }
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
}
