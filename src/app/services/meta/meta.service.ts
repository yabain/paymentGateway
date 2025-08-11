import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class MetaService {

  constructor(
    private meta: Meta,
    private metaTitleService: Title
  ) {
  }

  setDefaultMetatag() {
    this.meta.addTag({ name: 'og:image', content: 'assets/imgs/metatag_image.png' });
    // this.meta.updateTag({ name: 'og:image', content: 'assets/imgs/metatag_image.png' });
    
    this.meta.addTag({ name: 'og:image:type', content: 'image/png' });
    // this.meta.updateTag({ name: 'og:image:type', content: 'image/png' });
    
    this.meta.addTag({ name: 'og:title', content: 'Yabi-Event' });
    // this.meta.updateTag({ name: 'og:title', content: 'Yabi-Event' });
    
    this.meta.addTag({ name: 'title', content: 'Yabi-Event' });
    // this.meta.updateTag({ name: 'title', content: 'Yabi-Event' });
    
    this.meta.addTag({ name: 'og:description', content: 'Votre plateforme événementiel disponible en iOS, Android et web vous permettant de promouvoir la culture africaine en organisant des événements en toute simplicité, de suivre la mise en place, le procéssus événementiel et post-événement.' });
    // this.meta.updateTag({ name: 'og:description', content: 'Votre plateforme événementiel disponible en iOS, Android et web vous permettant de promouvoir la culture africaine en organisant des événements en toute simplicité, de suivre la mise en place, le procéssus événementiel et post-événement.' });
    
    this.meta.addTag({ name: 'description', content: 'Votre plateforme événementiel disponible en iOS, Android et web vous permettant de promouvoir la culture africaine en organisant des événements en toute simplicité, de suivre la mise en place, le procéssus événementiel et post-événement.' });
    // this.meta.updateTag({ name: 'description', content: 'Votre plateforme événementiel disponible en iOS, Android et web vous permettant de promouvoir la culture africaine en organisant des événements en toute simplicité, de suivre la mise en place, le procéssus événementiel et post-événement.' });
  
    this.meta.addTag({ name: 'keywords', content: 'app, application, event, events, événement, événements, événements, évènement, évènements, bangangte, software, cameroun, cameroon, cedric nguendap, flambel sanou, menkam tidjong' });
    // this.meta.updateTag({ name: 'keywords', content: 'app, application, event, events, événement, événements, événements, évènement, évènements, bangangte, software, cameroun, cameroon, cedric nguendap, flambel sanou, menkam tidjong' });
  }

  
  updateMetatags(tagTitle: string, tagImg: string, tagDescription: string) {
    this.metaTitleService.setTitle(tagTitle) // for sharing popup on device

    this.meta.updateTag({ name: 'og:image', content: tagImg });
    this.meta.updateTag({ name: 'og:type', content: 'Event' });
    
    // this.meta.addTag({ name: 'og:image:type', content: 'image/png' });
    this.meta.updateTag({ name: 'og:image:type', content: 'image/png' });
    
    // this.meta.addTag({ name: 'og:title', content: tagTitle });
    this.meta.updateTag({ name: 'og:title', content: tagTitle });
    
    // this.meta.addTag({ name: 'title', content: tagTitle });
    this.meta.updateTag({ name: 'title', content: tagTitle });
    
    // this.meta.addTag({ name: 'og:description', content: tagDescription });
    this.meta.updateTag({ name: 'og:description', content: tagDescription });
    
    // this.meta.addTag({ name: 'description', content: tagDescription });
    this.meta.updateTag({ name: 'description', content: tagDescription });
  }

  removeMetaTags() {
    this.meta.removeTag('name="og:image"');
    this.meta.removeTag('name="og:image:type"');
    this.meta.removeTag('name="og:title"');
    this.meta.removeTag('name="title"');
    this.meta.removeTag('name="og:description"');
    this.meta.removeTag('name="description"');
    this.meta.removeTag('name="keywords"');
  }
}
