import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { routes } from 'src/app/core/core.index';
import { LanguageService } from 'src/app/services/language/language.service';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-invoice-settings',
  templateUrl: './invoice-settings.component.html',
  styleUrls: ['./invoice-settings.component.scss']
})
export class InvoiceSettingsComponent {
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
    this.form = new FormGroup({
      invoiceTaxes: new FormControl(systemData?.invoiceTaxes || 5, [Validators.required]),
      transferTaxes: new FormControl(systemData?.transferTaxes || 5, [Validators.required]),
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
