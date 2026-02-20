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
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  frontUrl: string = environment.frontUrl;
  changePass = false;
  personalDetails = true;
  userData: any;
  name: any
  id: any
  key: any
  edition: boolean = false;
  form: FormGroup;
  saving: boolean = false;
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
  descriptionEdition: boolean = false;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService,
    private location: LocationService,
    private language: LanguageService,
    private dateService: DateService,
  ) {
  }

  ngOnInit(): void {
    this.scrollToTop();
    this.getData();
    this.profilePictureForm();
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
      this.toastService.presentToast('success', 'Copied !', '', 5 * 1000);
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
      && isActive
      && isVerified
    ) return true;
    else return false
  }

  formatDate(): string {
    return this.dateService.formatDate(this.currentUser.createdAt, 'short', this.currentUser.language);
  }

  userForm(userdata) {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]{2,5})?(\/.*)?$/i;
  
    this.form = new FormGroup({
      firstName: new FormControl(userdata?.firstName),
      lastName: new FormControl(userdata?.lastName),
      name: new FormControl(userdata?.name),
      phone: new FormControl(userdata?.phone || '', [Validators.required]),
      gender: new FormControl(userdata?.gender || ''),
      cityId: new FormControl(userdata?.cityId?._id || '', [Validators.required]),
      language: new FormControl(userdata?.language || '', [Validators.required]),
      address: new FormControl(userdata?.address || '', [Validators.required]),
      niu: new FormControl(userdata?.niu || ''),
      rccm: new FormControl(userdata?.rccm || ''),
  
      // 🌐 Liens non obligatoires, mais doivent être valides s’ils sont saisis
      facebook: new FormControl(userdata?.facebook || '', [Validators.pattern(urlPattern)]),
      website: new FormControl(userdata?.website || '', [Validators.pattern(urlPattern)]),
      linkedIn: new FormControl(userdata?.linkedIn || '', [Validators.pattern(urlPattern)]),
      instagram: new FormControl(userdata?.instagram || '', [Validators.pattern(urlPattern)]),
      twitter: new FormControl(userdata?.twitter || '', [Validators.pattern(urlPattern)]),
    });
  
    this.updateFormValidator();
  }
  
  updateFormValidator() {
    if (!this.form) return;
  
    if (this.currentUser.accountType === 'personal') {
      this.form.get('firstName')?.setValidators([Validators.required]);
      this.form.get('lastName')?.setValidators([Validators.required]);
  
      this.form.get('name')?.clearValidators();
      this.form.get('gender')?.clearValidators();
    } else {
      this.form.get('name')?.setValidators([Validators.required]);
  
      this.form.get('gender')?.clearValidators();
  
      this.form.get('firstName')?.clearValidators();
      this.form.get('lastName')?.clearValidators();
    }
  
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.updateValueAndValidity({ emitEvent: false });
    });
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
    this.saving= true;
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
          this.edit(false);
          this.descriptionEdition = false;
          this.saving= false;
          this.loading2 = false;
        } else {
          this.language.useLanguage(this.form.value.language);
          this.userService.setCurrentUser(userData);
          this.translate.get("profile.profileUpdated").subscribe((res: string) => {
            this.toastService.presentToast('success', 'Done !', res, 10000);
          })
          this.idrateCurrentUserData(userData);
          this.edit(false);
          this.descriptionEdition = false;
          this.saving= false;
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

  edit(value?: boolean) {
    if(value) {
      this.form.enable({ emitEvent: false });
      this.edition = value;
    }
    this.edition = !this.edition;
    if (!this.form) return;
    if (this.edition) {
      this.form.enable({ emitEvent: false });
      this.userForm(this.currentUser);
    } else {
      this.form.disable({ emitEvent: false });
    }
  }

  editDescription() {
    this.descriptionEdition = !this.descriptionEdition;
    if (this.descriptionEdition) {
      return;
    } else {
      this.description = this.currentUser.description;
    }
  }


  getData() {
    this.getCurrentUser();
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
      this.getCities();
      this.idrateCurrentUserData(this.currentUser);
      // Start in view mode with controls disabled to avoid template [disabled]
      this.form.disable({ emitEvent: false });
      this.saving= false;
    }
  }

  idrateCurrentUserData(userData){
    this.currentUser = userData;
    this.userForm(this.currentUser);
    this.description = userData.description;
    this.memoryImage = userData.pictureUrl;
  }
  /**
   * Saves the selected profile picture.
   */
  savePicture() {
    if (!this.uploadPictureForm.valid) {
      this.toastService.presentToast('error', 'Error', 'Invalid Picture');
      return;
    }
    this.uploadingPicture = true;
    this.userService.updateUserPicture(this.selectedImage)
      .subscribe
      ({
        next: (userData) => {
          if (userData.error) {
            this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
              this.toastService.presentToast('error', 'Error', res, 10000);
            });
          } else {
            this.translate.get("profile.profileUpdated").subscribe((res: string) => {
              this.toastService.presentToast('success', 'Done !', res, 10000);
            })
            this.userService.setCurrentUser(userData);
            // this.currentUser.pictureUrl = userData.pictureUrl;
            // this.refresh();
            this.isChangePicture = false;
          }
          this.uploadingPicture = false;
        },
        error: (error) => {
          this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
            this.toastService.presentToast('error', 'Error', res, 10000);
          });
          this.isChangePicture = false;
          this.uploadingPicture = false;
        },
      });
  }

  /**
   * Refreshes the page.
   */
  refresh(): void {
    window.location.reload();
  }

  getCities() {
    this.location.getCities().subscribe((cities) => {
      this.allCities = cities.filter((e) => e.countryId === this.currentUser.countryId._id);
      this.allCities = this.allCities.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  profilePictureForm() {
    this.uploadPictureForm = new FormGroup({
      pictureFile: new FormControl(undefined, Validators.required),
    });
  }

  cancel() {
    if (this.currentUser) {
      this.currentUser.pictureUrl = this.memoryImage;
      this.isChangePicture = false;
    }
  }

  /**
   * Toggles the state of profile picture change.
   * @param value - Boolean indicating change state
   */
  changePicture(value: boolean) {
    this.isChangePicture = value;
  }

  /**
 * Shows a preview of the selected image.
 * @param event - The file input event
 */
  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const maxSize = 1 * 1024 * 1024; // 1 MB en bytes
      
      if (file.size > maxSize) {
        this.translate.get("profile.imageTooLarge").subscribe((res: string) => {
          this.toastService.presentToast('error', 'Error', res || 'Image trop volumineuse (max 1 MB)', 5000);
        });
        event.target.value = '';
        return;
      }
    
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentUser.pictureUrl = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    } else {
      this.currentUser.pictureUrl = 'assets/imgs/pictures/new_image.png';
      this.selectedImage = null;
    }
  }

  showName(userData: any): string {
    return this.userService.showName(userData);
  }

  verifyUserConditions(user): boolean {
    if (user.isAdmin === true) return true;
    if (user.isActive !== true || user.verified !== true) return false;
    return true;
  }

  whatsappUrl(whatsapp) {
    let data = whatsapp.replace(' ', '');
    data = data.replace('+', '');
    return `https://wa.me/${data}`;
  }
}
