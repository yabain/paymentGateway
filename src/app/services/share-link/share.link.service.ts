import { Injectable } from '@angular/core';
// import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SystemService } from '../system/system.service';

export interface Share {
  title?: string;
  text?: string;
  url?: string;
}

interface ExtendNavigator extends Navigator {
  share: (share: Share) => Promise<void>;
}

interface ExtendWindow extends Window {
  navigator: ExtendNavigator;
}
@Injectable({
  providedIn: 'root'
})
export class ShareLinkService {
  share: Share;

  constructor(
    // private socialSharing: SocialSharing,
    private systemService: SystemService
  ) {}
  
  ShareGeneric(parameter, link){
    const url = link
    const text = parameter+'\n'
    // this.socialSharing.share(text, 'MEDIUM', null, url)
  }
  
  ShareWhatsapp(text, imgurl, link){
    // this.socialSharing.shareViaWhatsApp(text, imgurl, link)
  }

  ShareFacebook(text, imgurl){
    // this.socialSharing.shareViaFacebookWithPasteMessageHint(text, imgurl, null /* url */, 'Copied!')
  }

  SendEmail(){
    // this.socialSharing.shareViaEmail('text', 'subject', ['email@address.com'])
  }

  SendTwitter(text, imgurl, link){
    // this.socialSharing.shareViaTwitter(text, imgurl, link)
  }

  SendInstagram(text, imgurl){
    // this.socialSharing.shareViaInstagram(text, imgurl)
  }  

  
  shareEvent(autorInfo, message, sharLink) {
    return this.systemService.getRacineToshare()
      .then(data => {
        message = message + sharLink;
        this.copyTextToClipboard(message);

        this.share = {
          title: '',
          text: message,
          url: '',
        }
        window.navigator.share(this.share);
      });
  }
  
  async copyTextToClipboard(textToCopy: string) {
    try {
      // this.copyToClipboardFn(textToCopy);
      // this.toastService.presentToast('Le lien de partage a été copié.', 'top', 'info');
      // this.watingSharLink = false;
    } catch (error) {
      // console.error('Error copying text:', error);
      // this.watingSharLink = false;
    }
  }
}
