import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LocationService } from 'src/app/services/location/location.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { DateService } from 'src/app/services/pipe/date.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs';
import { UserSettingsService } from 'src/app/services/user/userSettings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  frontUrl: string = environment.frontUrl;
  changePass = false;
  personalDetails = true;
  userData: any;
  name: any
  id: any
  key: any
  edition: boolean = false;
  form: FormGroup;
  loading: boolean = false;
  loading2: boolean = false;
  loading3: boolean = true;
  userId: any;
  cover: string = "assets/img/resources/cover.png";
  currentUser: any;
  countries: any;
  uploadingPicture = false;
  uploadPictureForm: FormGroup;
  isChangePicture = false;
  memoryImage: string;
  selectedImage: any;
  allCities: any = [];
  description: string;
  headTitlePortal: string;
  headTitlePortalColor: string;
  headTextPortal: string;
  headTextPortalColor: string
  descriptionEdition: boolean = false;
  headTitlePortalEdition: boolean = false;
  headTextPortalEdition: boolean = false;
  ableToShow: boolean = false;
  userSettings: any;
  loadingSettings: boolean = true;
  portalPrimaryColor: string = '#021d66';
  portalSecondaryColor: string = '#F57C11';
  portalColorEdition: boolean;
  // canEdit: boolean = false;

  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService,
    private language: LanguageService,
    private dateService: DateService,
    private userSettingsService: UserSettingsService
  ) {
  }

  ngOnInit(): void {
    this.scrollToTop();
    this.getDatas();
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
  
  about() {
    this.changePass = false;
    this.personalDetails = true;
  }
  pass() {
    this.changePass = true;
    this.personalDetails = false;
  }
  editModal(template: TemplateRef<any>) {
    this.id = 1;
  }


  copy(data: string) {
    navigator.clipboard.writeText(data).then(() => {
      // Réinitialise le message après 2 secondes
      this.toastr.success('Copied !');
    }).catch(err => {
      console.error('Impossible de copier : ', err);
    });
  }

  update() {
    let params = {
      id: this.id,
      key: this.key,
      speciality: this.name,
    };
  }

  showAdvancedOptions(userData: any): boolean {
    if (!userData) return false;
    const { accountType, isAdmin, isActive, isVerified } = userData;
    if (isAdmin === true) return true;
    else if (
      accountType === 'organisation'
      && isActive !== false
      && isVerified === true
    ) return true;
    else return false
  }

  formatDate(): string {
    return this.dateService.formatDate(this.currentUser.createdAt, 'short', this.currentUser.language);
  }
  
  submit() {
    // Enable the form temporarily to check validity if it's disabled
    const wasDisabled = this.form.disabled;
    if (wasDisabled) {
      this.form.enable({ emitEvent: false });
    }
    
    // Mark all fields as touched to show validation errors
    this.form.markAllAsTouched();
    
    if (!this.form.valid) {
      // Log validation errors for debugging
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.error(`Field ${key}:`, control.errors);
        }
      });
      
      this.toastService.presentToast('error', 'Error', 'Invalid Form');
      return;
    }
    
    // Re-disable if it was disabled before
    if (wasDisabled) {
      this.form.disable({ emitEvent: false });
    }
    this.loading = true;
    this.saveUserData(this.form.value);
  }

  saveUserData(data){
    return this.userService.updateUserProfile(data)
    .subscribe
    ({
      next: (userData) => {
        if (!userData || userData.error) {
          this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
            this.toastService.presentToast('error', 'Error', res, 10000);
          });
          this.edition = false;
          this.descriptionEdition = false;
          this.loading = false;
          this.loading2 = false;
        } else {
          this.language.useLanguage(this.form.value.language);
          this.userService.setCurrentUser(userData);
          this.translate.get("profile.profileUpdated").subscribe((res: string) => {
            this.toastService.presentToast('success', 'Done !', res, 10000);
          })
          this.idrateCurrentUserData(userData);
          this.edition = false;
          this.descriptionEdition = false;
          this.loading = false;
          this.loading2 = false; 
        }
      },
      error: (error) => {
        this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
          this.toastService.presentToast('error', 'Error', res, 10000);
        });
      }
    });
  }

  saveDescription(){
    this.loading2 = true;
    this.saveUserData({description: this.description});
  }


  editDescription() {
    this.descriptionEdition = !this.descriptionEdition;
    if (this.descriptionEdition) {
      return;
    } else {
      this.description = this.currentUser.description;
    }
  }

  editHeadTitlePortalPage() {
    this.headTitlePortalEdition = !this.headTitlePortalEdition;
    if (this.headTitlePortalEdition) {
      return;
    } else {
      this.headTitlePortal = this.currentUser.headTitlePortal || '';
      this.headTitlePortalColor = this.currentUser.headTitlePortalColor || '';
    }
  }

  editHeadTextPortalPage() {
    this.headTextPortalEdition = !this.headTextPortalEdition;
    if (this.headTextPortalEdition) {
      return;
    } else {
      this.headTextPortal = this.currentUser.headTextPortal || '';
      this.headTextPortalColor = this.currentUser.headTextPortalColor || '';
    }
  }

  editPortalColor() {
    this.portalColorEdition = !this.portalColorEdition;
    if (this.portalColorEdition) {
      return;
    } else {
      this.portalPrimaryColor = this.currentUser.portalPrimaryColor || this.portalPrimaryColor;
      this.portalSecondaryColor = this.currentUser.portalSecondaryColor || this.portalSecondaryColor;
    }
  }

  getDatas() {
    this.getCurrentUser();
    this.getUserSettings();
  }

  getUserSettings(){
    this.loadingSettings = true;
    this.userSettingsService.getUserSettings()
    .subscribe((res: any) => {
      if(res) {
        this.idrateSettingsData(res);
      }
      console.log('user settings:', res)
      this.loadingSettings = false;
    })
  }

  idrateSettingsData(data){
    this.userSettings = data;
    this.headTitlePortal = data.headTitlePortal;
    this.headTextPortal = data.headTextPortal;
    this.headTextPortalColor = data.headTextPortalColor;
    this.headTitlePortalColor = data.headTitlePortalColor;
    this.portalPrimaryColor = data.portalPrimaryColor;
    this.portalSecondaryColor = data.portalSecondaryColor;
  }

  saveSettingsData(val: string = 'description'){
    this.loading2 = true;
    let data: any;
    if(val === "headTitlePortal") data = {
      headTitlePortal: this.headTitlePortal,
      headTitlePortalColor: this.headTitlePortalColor
    }
    else if(val === "headTextPortal") data = {
      headTextPortal: this.headTextPortal,
      headTextPortalColor: this.headTextPortalColor
    }
    else if(val === "portalColor") data = {
      portalPrimaryColor: this.portalPrimaryColor,
      portalSecondaryColor: this.portalSecondaryColor
    }
    this.userSettingsService.updateSettingsData(data)
      .subscribe
      ({
        next: (userSettings) => {
          if (!userSettings) {
            this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
              this.toastService.presentToast('error', 'Error', res, 10000);
            });
          } else {
            this.userSettingsService.setSettingsToStorage(userSettings);
            this.translate.get("profile.profileUpdated").subscribe((res: string) => {
              this.toastService.presentToast('success', 'Done !', res, 10000);
            })
            this.idrateSettingsData(userSettings);
            console.log('user settings:', userSettings)
            this.descriptionEdition = false;
            this.headTextPortalEdition = false;
            this.headTitlePortalEdition = false;
            this.portalColorEdition = false;
            this.loading2 = false;
          }
        },
        error: (error) => {
          this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
            this.toastService.presentToast('error', 'Error', res, 10000);
          });
          this.loading2 = false;
        }
      });
  }

  changeUserPortalStatus(){
    this.loading3 = true;
    const data = {
      portal: !this.userSettings.portal
    }
    this.userSettingsService.updateSettingsData(data)
    .subscribe
    ({
      next: (resp) => {
        if (!resp) {
          this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
            this.toastService.presentToast('error', 'Error', res, 10000);
          });
        } else {
          this.userSettings = resp;
          this.toastService.presentToast('success', 'Done !', '', 3000);
          this.loading3 = false;
        }
      },
      error: (error) => {
        this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
          this.toastService.presentToast('error', 'Error', res, 10000);
        });
        this.loading3 = false;
      }
    });
  }

  toggleService(option: string): void {
    if (!this.userSettings) return;

    const currentValue = !!this.userSettings[option];
    const payload = { [option]: !currentValue };

    this.userSettingsService.updateSettingsData(payload).subscribe((res: any) => {
      if (!res) return;
      this.userSettings = res;
      this.toastService.presentToast('success', 'Done !', '', 3000);
      this.userSettingsService.setSettingsToStorage(res);
    });
  }

  async getCurrentUser() {
    this.loading3 = true;
    this.currentUser = await this.userService.getCurrentUser();
    if(this.currentUser) {
      this.currentUser = this.userData = await this.userService.getUser(this.currentUser._id)
      .pipe(take(1)).toPromise();
      if(this.currentUser) this.userService.setCurrentUser(this.currentUser);
    };
    this.loading3 = false;
    if (this.currentUser) {
      this.idrateCurrentUserData(this.currentUser);
      // Start in view mode with controls disabled to avoid template [disabled]
      this.form.disable({ emitEvent: false });
      this.loading = false;
    }
  }

  idrateCurrentUserData(userData){
    this.currentUser = userData;
    this.description = userData.description;
    this.memoryImage = userData.pictureUrl;
    this.ableToShow = this.verifyUserConditions(this.currentUser) ? true : false;
  }

  /**
   * Refreshes the page.
   */
  refresh(): void {
    window.location.reload();
  }

  verifyUserConditions(user): boolean {
    if (user.accountType !== 'organisation' && user.isAdmin !== true) return false;
    if (user.isActive !== true) return false;
    if (user.verified !== true) return false;
    return true;
  }
}
