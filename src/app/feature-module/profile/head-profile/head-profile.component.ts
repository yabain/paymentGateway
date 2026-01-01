import { Component, Input, OnInit, TemplateRef } from '@angular/core';
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

@Component({
  selector: 'app-head-profile',
  templateUrl: './head-profile.component.html',
  styleUrls: ['./head-profile.component.scss'],
})
export class HeadProfileComponent implements OnInit {
    @Input() userData: any;
    @Input() canEdit: boolean = false;
  name: any
  id: any
  key: any
  edition: boolean = false;
  form: FormGroup;
  loading: boolean = false;
  loading2: boolean = false;
  userId: any;
  cover: string = "assets/img/ressorces/cover.png";
  countries: any;
  uploadingPicture = false;
  uploadPictureForm: FormGroup;
  isChangePicture = false;
  memoryImage: string;
  selectedImage: any;
  allCities: any = [];
  description: string
  descriptionEdition: boolean = false;

  constructor(
    private Router: Router,
    private storage: StorageService,
    private toastr: ToastrService,
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService,
    private location: LocationService,
    private language: LanguageService,
    private dateService: DateService,
  ) {
  }

  ngOnInit(): void {
    this.profilePictureForm();
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
          // console.log('userData: ', userData)
          if (userData.error) {
            this.translate.get("profile.profileUpdatedError").subscribe((res: string) => {
              this.toastService.presentToast('error', 'Error', res, 10000);
            });
          } else {
            this.translate.get("profile.profileUpdated").subscribe((res: string) => {
              this.toastService.presentToast('success', 'Done !', res, 10000);
            })
            this.userService.setCurrentUser(userData);
            this.userData.pictureUrl = userData.pictureUrl;
            this.refresh();
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
      this.allCities = cities.filter((e) => e.countryId === this.userData.countryId._id);
      this.allCities = this.allCities.sort((a, b) => a.name.localeCompare(b.name));
    });
  }


  profilePictureForm() {
    this.uploadPictureForm = new FormGroup({
      pictureFile: new FormControl(undefined, Validators.required),
    });
  }


  cancel() {
    if (this.userData) {
      this.userData.pictureUrl = this.memoryImage;
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
        this.userData.pictureUrl = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    } else {
      this.userData.pictureUrl = 'assets/imgs/pictures/new_image.png';
      this.selectedImage = null;
    }
  }

  showName(userData: any): string {
    return this.userService.showName(userData);
  }

  whatsappUrl(whatsapp) {
    let data = whatsapp.replace(' ', '');
    data = data.replace('+', '');
    return `https://wa.me/${data}`;
  }
}
