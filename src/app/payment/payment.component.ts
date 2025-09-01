import { Component } from '@angular/core';
import { FlutterwaveService } from '../services/flutterwave/flutterwave.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  amount = 100;
  status = '';
  private txRef: string = '';
  private pollTimer: any;

  constructor(private fw: FlutterwaveService) {
    console.log('test')
  }

  async pay() {
    await this.fw.loadFlutterwaveScript();
    const init = await this.fw.initializePayment(this.amount, 'customer@example.com', 'NGN');
    this.txRef = init.txRef;
    console.log('init', this.txRef)
    this.fw.openFlutterwaveModal({
      txRef: this.txRef,
      amount: init.amount,
      currency: init.currency,
      customerEmail: init.customerEmail,
      publicKey: init.publicKey,
    });
    // lance un polling qui vérifie régulièrement le status
    this.startPolling();
  }

  startPolling() {
  if (!this.txRef) return;
  if (this.pollTimer) clearInterval(this.pollTimer);

  this.pollTimer = setInterval(async () => {
    try {
      const resp: any = await this.fw.checkStatus(this.txRef);
      const status = resp?.data?.data?.status || resp?.data?.status || resp?.status || 'pending';
      this.status = status;
      console.log('status', status);

      // Arrêter le polling uniquement si le paiement est dans un état final
      if (['successful', 'success', 'failed', 'cancelled'].includes(status.toLowerCase())) {
        clearInterval(this.pollTimer);
      }
    } catch (err) {
      console.warn('polling error', err);
    }
  }, 5000);
}
}
