import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  changePass = false;
  personalDetails = true;
  userData: any;
  name: any
  id: any
  key: any
  edition: boolean = false;
  form: FormGroup;
  loading: boolean = false;
  userId: any;
  cover: string = "assets/img/ressorces/cover.jpeg";
  currentUser: any;
  countries: any;
  uploadingPicture = false;
  uploadPictureForm: FormGroup;
  isChangePicture = false;
  memoryImage: string;
  selectedImage: any;

  constructor(
    private Router: Router,
    private storage: StorageService,
    private toastr: ToastrService,
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.getDatas();
    this.profilePictureForm();
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

  update() {
    let params = {
      id: this.id,
      key: this.key,
      speciality: this.name,
    };
  }

  userForm(userdata) {
    this.form = new FormGroup({
      firstName: new FormControl(userdata?.firstName ? userdata?.firstName : '', [Validators.required,]),
      lastName: new FormControl(userdata?.lastName ? userdata?.lastName : '', [Validators.required,]),
      email: new FormControl(userdata?.email ? userdata?.email : '', { validators: [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')] }),
      phone1: new FormControl(userdata?.phone1 ? userdata?.phone1 : '', [Validators.required,]),
      phone2: new FormControl(userdata?.phone2 ? userdata?.phone2 : ''),
      location: new FormControl(userdata?.location ? userdata?.location : ''),
      sexe: new FormControl(userdata?.sexe ? userdata?.sexe : '', [Validators.required,]),
    });
  }

  submit() {
    
  }

  edit() {
    this.edition = !this.edition;
  }

  getDatas() {
    this.getCurrentUser();
  }

  async getCurrentUser(){
    this.currentUser = await this.userService.getCurrentUser();
    this.userData = this.currentUser;
    this.memoryImage = this.currentUser.pictureUrl
    if (this.currentUser) this.loading = false;
    console.log(this.currentUser)
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
            this.translate.get("event.updateError").subscribe((res: string) => {
              this.toastService.presentToast('error', 'Error', res, 10000);
            });
          } else {
            this.translate.get("profile.pictureSaved").subscribe((res: string) => {
              this.toastService.presentToast('success', 'Done !', res, 10000);
            })
            this.userService.setCurrentUser(userData);
            // this.currentUser.pictureUrl = userData.pictureUrl;
            this.refresh();
            this.isChangePicture = false;
          }
          this.uploadingPicture = false;
        },
        error: (error) => {
          this.translate.get("event.updateError").subscribe((res: string) => {
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
}
