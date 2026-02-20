import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { routes } from 'src/app/core/core.index';
import { LanguageService } from 'src/app/services/language/language.service';
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

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService,
    private language: LanguageService,
  ) {
  }

  ngOnInit(): void {
    this.scrollToTop();
    this.getData();
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

  getData() {
    // this.getSystemData();
  }

  onSelect(event: { addedFiles: File[] }) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event:File) {
   this.files.splice(this.files.indexOf(event), 1);
  }

  appLogoForm() {
    this.uploadLogoForm = new FormGroup({
      logoFile: new FormControl(undefined, Validators.required),
    });
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
      this.systemForm(this.systemData);
    } else {
      this.form.disable({ emitEvent: false });
    }
  }

  systemForm(systemData) {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]{2,5})?(\/.*)?$/i;
    this.form = new FormGroup({
    defaultLang:  new FormControl(systemData?.defaultLang || 'en', [Validators.pattern(urlPattern)]),
    appVersion:  new FormControl(systemData?.appVersion || '1.0.1', [Validators.pattern(urlPattern)]),
    companyName:  new FormControl(systemData?.companyName || 'digiKUNTZ Ltd', [Validators.pattern(urlPattern)]),
    appName:  new FormControl(systemData?.appName || 'digiKUNTZ Payments', [Validators.pattern(urlPattern)]),
    appLogoUrl:  new FormControl(systemData?.appLogoUrl || ''),
    invoiceTaxes:  new FormControl(systemData?.invoiceTaxes || 5, [Validators.pattern(urlPattern)]),
    transferTaxes:  new FormControl(systemData?.transferTaxes || 5, [Validators.pattern(urlPattern)]),
    niu:  new FormControl(systemData?.niu || ''),
    rccm:  new FormControl(systemData?.rccm || ''),
    addressLine1:  new FormControl(systemData?.addressLine1 || ''),
    defaultCurrency:  new FormControl(systemData?.defaultCurrency || 'XAF'),
    companyEmail:  new FormControl(systemData?.companyEmail, [Validators.pattern(urlPattern)]), // email list with ";" for separation eg: "test@gmail.com;exemple@gmail.com"
    companyWhatsapp:  new FormControl(systemData?.companyWhatsapp, [Validators.pattern(urlPattern)]), // whatsapp number list with ";" for separation eg: "237 677889900; 237 699887766"
    addressLine2:  new FormControl(systemData?.addressLine2 || ''),
    paymentGatwayAPIKey:  new FormControl(systemData?.paymentGatwayAPIKey || ''),
    racineLink:  new FormControl(systemData?.racineLink || ''),
    
    facebook: new FormControl(systemData?.facebook || '', [Validators.pattern(urlPattern)]),
    website: new FormControl(systemData?.website || '', [Validators.pattern(urlPattern)]),
    linkedIn: new FormControl(systemData?.linkedIn || '', [Validators.pattern(urlPattern)]),
    instagram: new FormControl(systemData?.instagram || '', [Validators.pattern(urlPattern)]),
    twitter: new FormControl(systemData?.twitter || '', [Validators.pattern(urlPattern)]),

    });
  }
}
