import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { FundraisingService } from 'src/app/services/fundraising/fundraising.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/services/storage/storage.service';
import { FieldValidationService } from 'src/app/services/field-validation/field-validation.service';

@Component({
  selector: 'app-fundraising-details',
  templateUrl: './fundraising-details.component.html',
  styleUrls: ['./fundraising-details.component.scss'],
})
export class FundraisingDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentUser: any;
  loading = true;
  updating = false;
  donating = false;

  fundraisingId = '';
  donationId = '';
  url: string = '';

  fundraisingData: any = null;
  donationStats: any = null;
  donations: any[] = [];
  donationDetails: any = null;
  copied = false;

  isAdminRoute = false;
  waitingCurrentUser: boolean = true;
  isAdmin: boolean = false;
  currency: string;
  edition: boolean = false;

  editForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    targetAmount: new FormControl(0, [Validators.required]),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    visibility: new FormControl('public', [Validators.required]),
  });

  donateForm = new FormGroup({
    amount: new FormControl(0, [Validators.required]),
    message: new FormControl(''),
  });

  isChangePicture = false;
  uploadPictureForm: FormGroup;
  memoryImage: string;
  selectedImage: any;
  uploadingPicture = false;
  coverImageUrl: string = 'assets/img/resources/package_img.png';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fundraisingService: FundraisingService,
    private toastService: ToastService,
    private userService: UserService,
    private storage: StorageService,
    private fieldValidationService: FieldValidationService,
  ) { }

  changePicture(value: boolean) {
    this.isChangePicture = value;
  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fundraisingData.coverImageUrl = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      // console.log('img: ', this.selectedImage)
    } else {
      this.fundraisingData.coverImageUrl = 'assets/imgs/pictures/new_image.png';
      this.selectedImage = null;
    }
  }


  cancel() {
    if (this.fundraisingData) {
      this.fundraisingData.coverImageUrl = this.memoryImage;
      this.isChangePicture = false;
    }
  }

  ngOnInit(): void {
    this.pictureForm();
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


  savePicture() {
    if (!this.selectedImage || !(this.selectedImage instanceof File)) {
      this.toastService.presentToast('error', 'Error', 'Please select a valid image file');
      return;
    }
    
    this.uploadingPicture = true;
    
    this.fundraisingService.updateServicePicture(this.fundraisingData._id, this.selectedImage)
      .subscribe
      ({
        next: (data) => {
          if (data.error) {
            this.toastService.presentToast('error', 'Error', '', 10000);
          } else {
            this.toastService.presentToast('success', 'Done !', '', 10000);
            this.fundraisingData = data;
            // this.refresh();
            this.isChangePicture = false;
          }
          this.uploadingPicture = false;
        },
        error: (error) => {
          this.toastService.presentToast('error', 'Error', error, 10000);
          this.isChangePicture = false;
          this.uploadingPicture = false;
        },
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
        console.log('fundraising data 2', data)
        this.getCurrentUser();
        this.patchFormWithData();
        this.applyAmountValidators(this.fundraisingData?.currency || this.currentUser?.countryId?.currency || 'XAF');
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


  pictureForm() {
    this.uploadPictureForm = new FormGroup({
      pictureFile: new FormControl(undefined, Validators.required),
    });
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

  getCurrentUser() {
    this.waitingCurrentUser = true;
    this.userService.getCurrentUser().then((user: any) => {
      if (!user) return (this.waitingCurrentUser = false);
      this.currentUser = user;
      this.isAuthor(this.fundraisingData);
      if (user.isAdmin) this.isAdmin = true;
      this.currency = this.fundraisingData.currency;
      this.applyAmountValidators(this.currency || this.currentUser?.countryId?.currency || 'XAF');

      return (this.waitingCurrentUser = true);
    });
  }

  applyAmountValidators(currency: string): void {
    this.editForm
      .get('targetAmount')
      ?.setValidators([
        Validators.required,
        this.fieldValidationService.currencyAmountValidator(() => currency),
      ]);
    this.editForm.get('targetAmount')?.updateValueAndValidity();

    this.donateForm
      .get('amount')
      ?.setValidators([
        Validators.required,
        this.fieldValidationService.currencyAmountValidator(() => currency),
      ]);
    this.donateForm.get('amount')?.updateValueAndValidity();
  }

  isAuthor(fundraising: any, user: any = this.currentUser) {
    return user?._id.toString() === fundraising?.creatorId._id.toString() ? true : false;
  }

  updateFundraising(): void {
    if (this.editForm.invalid || !this.fundraisingId) {
      this.editForm.markAllAsTouched();
      return;
    }

    const currency = this.fundraisingData?.currency || this.currentUser?.countryId?.currency || 'XAF';
    const targetAmount = this.fieldValidationService.parseAmount(this.editForm.value.targetAmount);
    if (!this.fieldValidationService.isValidAmount(targetAmount, currency)) {
      this.toastService.presentToast(
        'error',
        'Error',
        `Montant invalide (${this.fieldValidationService.getRangeMessage(currency)})`,
      );
      return;
    }

    this.updating = true;
    const payload = this.removeEmpty(this.editForm.value);
    this.fundraisingService
      .updateFundraising(this.fundraisingId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.updating = false;
        this.edition = false;
        if (res?.error) {
          this.toastService.presentToast('error', 'Error', 'Operation failed');
          return;
        }

        this.toastService.presentToast('success', 'Success', 'Fundraising updated');
        this.loadFundraising();
      });
  }


  copyUrl() {
    const url = this.getUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;

      // Réinitialise le message après 2 secondes
      this.toastService.presentToast('success', 'Copied !', '', 5000);
      setTimeout(() => this.copied = false, 2000);
    }).catch(err => {
      console.error('Impossible de copier : ', err);
    });
  }

  getUrl(): string {
    return environment.frontUrl + '/fundraising-details/' + this.fundraisingId;
  }

  navigateTo(route) {
    if (!this.currentUser && route === '/auth/login') {
      this.storage.setStorage(environment.memory_link, this.url);
    }
    this.ngOnDestroy();
    this.router.navigate([route]);
  }


  showName(userData) {
    return this.userService.showName(userData);
  }

  toggleStatus(): void {
    if (!this.fundraisingId) {
      return;
    }

    const current = this.fundraisingData?.status ?? false;
    console.log('current', current)

    this.fundraisingService
      .updateStatus(this.fundraisingId, !Boolean(current))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
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

    const currency = this.fundraisingData?.currency || this.currentUser?.countryId?.currency || 'XAF';
    const amount = this.fieldValidationService.parseAmount(this.donateForm.value.amount);
    if (!this.fieldValidationService.isValidAmount(amount, currency)) {
      this.toastService.presentToast(
        'error',
        'Error',
        `Montant invalide (${this.fieldValidationService.getRangeMessage(currency)})`,
      );
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
        console.log('donation details', data)
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
