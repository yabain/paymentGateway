import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { routes } from 'src/app/core/core.index';
import { LanguageService } from 'src/app/services/language/language.service';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-company-settings',
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss']
})
export class CompanySettingsComponent implements OnInit {
  public routes = routes
  files: File[] = [];
  edition: boolean = false;
  form: FormGroup;
  uploadLogoForm: FormGroup;
  logoUrl: string = "assets/img/resources/cover.png";
  systemData: any;
  loading: boolean = true;
  saving: boolean = false;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService,
    private language: LanguageService,
    private systemService: SystemService,
  ) {
  }

  ngOnInit(): void {
    this.scrollToTop();
    this.systemForm({});
    this.getSystemData();
    this.appLogoForm();
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

  getSystemData() {
    this.loading = true;
    this.systemService.getSystemData().subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.systemData = res;
        this.logoUrl = this.systemData?.appLogoUrl || "assets/img/resources/dk_logo.png";
        this.systemForm(this.systemData);
        this.loading = false;
        this.edit(false);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.edit(false);
      }
    })
  }


  onSelect(event: { addedFiles: File[] }) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  appLogoForm() {
    this.uploadLogoForm = new FormGroup({
      logoFile: new FormControl(undefined, Validators.required),
    });
  }

  edit(value: boolean) {
    this.edition = value;
    if (this.edition) {
      this.form.enable({ emitEvent: true });
    } else {
      this.form.disable({ emitEvent: false });
    }
}

  systemForm(systemData) {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]{2,5})?(\/.*)?$/i;
    const emailListPattern =
      /^\s*([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*\s*$/;
    this.form = new FormGroup({
      defaultLang: new FormControl(systemData?.defaultLang || 'en', [Validators.required]),
      appVersion: new FormControl(systemData?.appVersion || '1.0.1', [Validators.required]),
      companyName: new FormControl(systemData?.companyName || 'digiKUNTZ Ltd', [Validators.required]),
      appName: new FormControl(systemData?.appName || 'digiKUNTZ Payments', [Validators.required]),
      appLogoUrl: new FormControl(systemData?.appLogoUrl || '', [Validators.pattern(urlPattern)]),
      niu: new FormControl(systemData?.niu || ''),
      rccm: new FormControl(systemData?.rccm || ''),
      defaultCurrency: new FormControl(systemData?.defaultCurrency || 'XAF'),
      companyEmail: new FormControl(systemData?.companyEmail, [Validators.pattern(emailListPattern)]), // email list with ";" for separation eg: "test@gmail.com;exemple@gmail.com"
      companyWhatsapp: new FormControl(systemData?.companyWhatsapp || ''), // whatsapp number list with ";" for separation eg: "237 677889900; 237 699887766"
      addressLine2: new FormControl(systemData?.addressLine2 || ''),
      addressLine1: new FormControl(systemData?.addressLine1 || ''),
      companyPhone2: new FormControl(systemData?.companyPhone2 || ''),
      companyPhone1: new FormControl(systemData?.companyPhone1 || ''),
      paymentGatwayAPIKey: new FormControl(systemData?.paymentGatwayAPIKey || ''),
      racineLink: new FormControl(systemData?.racineLink || ''),

      facebook: new FormControl(systemData?.facebook || '', [Validators.pattern(urlPattern)]),
      website: new FormControl(systemData?.website || '', [Validators.pattern(urlPattern)]),
      linkedIn: new FormControl(systemData?.linkedIn || '', [Validators.pattern(urlPattern)]),
      instagram: new FormControl(systemData?.instagram || '', [Validators.pattern(urlPattern)]),
      twitter: new FormControl(systemData?.twitter || '', [Validators.pattern(urlPattern)]),
    });
  }

  submit() {
    const wasDisabled = this.form.disabled;
    if (wasDisabled) {
      this.form.enable({ emitEvent: false });
    }

    this.form.markAllAsTouched();

    if (!this.form.valid) {
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
    this.saveSystemData(this.form.value);
  }


  saveSystemData(data) {
    this.saving = true;
    return this.systemService.updateSystemData(data)
      .subscribe
      ({
        next: (systemData) => {
          if (!systemData || systemData.error) {
            this.toastService.presentToast('error', 'Error', 'Error to update system data', 10000);
            this.edit(false);
            this.saving = false;
          } else {
            this.toastService.presentToast('success', 'Done !', 'System data updated', 10000);
            this.edit(false);
            this.saving = false;
          }
        },
        error: (error) => {
          this.toastService.presentToast('error', 'Error', 'Error to update system data', 10000);
          this.saving = false;
        }
      });
  }
}
