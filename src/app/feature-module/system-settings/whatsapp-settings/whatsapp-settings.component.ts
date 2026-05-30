import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-whatsapp-settings',
  templateUrl: './whatsapp-settings.component.html',
  styleUrls: ['./whatsapp-settings.component.scss'],
})
export class WhatsappSettingsComponent implements OnInit {
  enabled = true;
  loading = true;
  saving = false;
  systemData: any;

  constructor(
    private systemService: SystemService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.getSystemData();
  }

  getSystemData(): void {
    this.loading = true;
    this.systemService.getSystemData().subscribe({
      next: (systemData: any) => {
        this.systemData = systemData;
        this.enabled = systemData?.whatsappNotificationsEnabled !== false;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.presentToast('error', 'Error', 'Unable to load WhatsApp settings', 7000);
      },
    });
  }

  toggleWhatsappNotifications(): void {
    const nextValue = !this.enabled;
    this.saving = true;
    this.systemService
      .updateSystemData({ whatsappNotificationsEnabled: nextValue })
      .subscribe({
        next: (systemData: any) => {
          this.systemData = systemData;
          this.enabled = systemData?.whatsappNotificationsEnabled !== false;
          this.saving = false;
          this.toastService.presentToast('success', 'Done!', 'WhatsApp settings updated', 7000);
        },
        error: () => {
          this.saving = false;
          this.toastService.presentToast('error', 'Error', 'Unable to update WhatsApp settings', 7000);
        },
      });
  }
}
