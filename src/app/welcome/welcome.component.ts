import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LanguageService } from '../services/language/language.service';
import { StorageService } from '../services/storage/storage.service';

type Industry = {
  key: 'transfer' | 'fundraising' | 'services' | 'subscriptionPlan';
  title: string;
  heroTitle: string;     // multi-line
  heroBg: string;        // image background
  heroProduct: string;   // png/webp détouré
  blurb: string;
  route: string;
};

type Product = {
  name: string;
  from: string;
  img: string;
  tag?: string;
  route: string;
};

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private isBrowser: boolean;
  appName: string = environment.appName;
  en: any;
  fr: any;
  selectedLanguage: any = '';
  changingLang: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private languageService: LanguageService,
    private storage: StorageService,
    private router: Router,
  ) {
    this.getLanguage();
    this.en = this.languageService.en[0];
    this.fr = this.languageService.fr[0];
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.getIfIsConnected().then((response) => {
      if (response === true) {
        this.router.navigateByUrl('/tabs', { replaceUrl: true });
      }
    });
    this.scrollToTop();
  }


  /**
   * Checks if a user is already connected by checking local storage
   * @returns A promise that resolves to true if the user is authenticated
   */
  async getIfIsConnected(): Promise<boolean> {
    const isAuth = await this.storage.getStorage(environment.user_data);
    return isAuth ? true : false;
  }

  async getLanguage() {
    this.selectedLanguage = await this.languageService.getDefaultLanguage();
    console.log('lang 0 ', this.selectedLanguage);
    this.selectedLanguage = this.selectedLanguage === 'en' ? 'en' : 'fr';
  
    console.log('lang ', this.en);
  }

  year = new Date().getFullYear();

  logo = [
    { name: 'logo', link: 'assets/img/resources/dk_logo.png', alt: this.appName },
    { name: 'icon', link: 'assets/img/resources/icon.jpg', alt: this.appName },
  ];

  logoPartners = [
    // { name: 'GIC', link: 'assets/img/resources/logo_gic_0.png', alt: 'Gic Promote Ltd', width: 100 },
    // { name: 'M-Pesa', link: 'assets/img/resources/mpesa_logo.png', alt: 'M-Pesa', width: 300 },
    { name: 'Flutterwave', link: 'assets/img/resources/fw_logo.png', alt: 'Flutterwave', width: 300 },
    { name: 'Yaba-In', link: 'assets/img/resources/logo_yaba-in.png', alt: 'Yaba-In', width: 300 },
    { name: 'Yabi', link: 'assets/img/resources/logo_yabi.png', alt: 'Yabi', width: 200 },
  ];
  nav = [
    { label: 'Home', route: '/welcome' },
    { label: 'Contact Us', route: '/contact' },
    // { label: 'terms.title', route: '/terms' },
    { label: 'dev.apiDoc', route: '/api-doc' },
  ];
  socials = [
    { link: 'https://www.facebook.com/', icon: 'facebook', label: 'f', name: 'Facebook' },
    { link: 'https://www.twitter.com/', icon: 'twitter', label: 'X', name: 'Twitter' },
    { link: 'https://www.linkedin.com/', icon: 'linkedin', label: 'in', name: 'LinkedIn' },
  ];

  industries: Industry[] = [
    {
      key: 'transfer',
      title: 'welcome.transfer.title',
      heroTitle: 'welcome.transfer.subtitle',
      heroBg: '../../assets/img/resources/transfer_bg.webp',
      heroProduct: '../../assets/img/resources/transfer.png',
      blurb: 'welcome.transfer.description',
      route: '/transfer',
    },
    {
      key: 'subscriptionPlan',
      title: 'welcome.subscriptionPlan.title',
      heroTitle: 'welcome.subscriptionPlan.subtitle',
      heroBg: '../../assets/img/resources/subscriptionPlan_bg.webp',
      heroProduct: 'assets/welcome/hero-tray.webp',
      blurb: 'welcome.subscriptionPlan.description',
      route: '/plans',
    },
    {
      key: 'fundraising',
      title: 'welcome.fundraising.title',
      heroTitle: 'welcome.fundraising.subtitle',
      heroBg: '../../assets/img/resources/fundraising_bg.webp',
      heroProduct: 'assets/welcome/hero-produce.webp',
      blurb: 'welcome.fundraising.description',
      route: '/fundraising',
    },
    {
      key: 'services',
      title: 'welcome.services.title',
      heroTitle: 'welcome.services.subtitle',
      heroBg: '../../assets/img/resources/service_bg.webp',
      heroProduct: 'assets/welcome/hero-produce.webp',
      blurb: 'welcome.services.description',
      route: '/services',
    },
  ];

  // Hero background crossfade + text refresh key
  selected = 0;
  prevBg: string | null = null;
  bgFading = false;
  heroKey = 0;

  // Cards (active card expanded)
  activeCard = 0;

  // New products (section complète)
  products: Product[] = [
    {
      name: 'Single Wall Matte Black Coffee Cup',
      from: 'From R1.09 incl. vat',
      img: 'assets/welcome/p1.webp',
      tag: 'NEW',
      route: '/shop',
    },
    {
      name: 'Paper Pulp Cup Holder',
      from: 'From R1.55 incl. vat',
      img: 'assets/welcome/p2.webp',
      tag: 'NEW',
      route: '/shop',
    },
    {
      name: 'Dessert Cup (90mm)',
      from: 'From R1.38 incl. vat',
      img: 'assets/welcome/p3.webp',
      tag: 'NEW',
      route: '/shop',
    },
    {
      name: 'Dessert Cup Flat Lid (90mm)',
      from: 'From R0.63 incl. vat',
      img: 'assets/welcome/p4.webp',
      tag: 'NEW',
      route: '/shop',
    },
  ];

  // Custom solutions marquee
  marqueeItems = Array.from({ length: 18 }, (_, i) => i);
  trackByIndex = (i: number) => i;

  // Trust pillars for the platform
  certLeft = [
    'welcome.certs.items.0',
    'welcome.certs.items.1',
    'welcome.certs.items.2',
    'welcome.certs.items.3',
    'welcome.certs.items.4',
  ];
  certRight = [
    'welcome.certs.items.5',
    'welcome.certs.items.6',
    'welcome.certs.items.7',
    'welcome.certs.items.8',
    'welcome.certs.items.9',
  ];

  // FAQ (keys from i18n files)
  faqs = [
    { q: 'welcome.faq.items.0.q', a: 'welcome.faq.items.0.a' },
    { q: 'welcome.faq.items.1.q', a: 'welcome.faq.items.1.a' },
    { q: 'welcome.faq.items.2.q', a: 'welcome.faq.items.2.a' },
    { q: 'welcome.faq.items.3.q', a: 'welcome.faq.items.3.a' },
    { q: 'welcome.faq.items.4.q', a: 'welcome.faq.items.4.a' },
  ];
  openFaq: number | null = null;

  // Reveal on scroll
  @ViewChildren('reveal', { read: ElementRef }) revealEls!: QueryList<ElementRef<HTMLElement>>;
  private io?: IntersectionObserver;

  // Spotlight (perf safe)
  private rafId = 0;
  private pendingEvt: PointerEvent | null = null;
  private hoveredCardEl: HTMLElement | null = null;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add('is-in');
        }
      },
      { threshold: 0.12 }
    );

    this.revealEls.forEach((r) => this.io!.observe(r.nativeElement));

    this.destroyRef.onDestroy(() => {
      this.io?.disconnect();
      if (this.rafId) cancelAnimationFrame(this.rafId);
    });

    // Preload hero assets (évite le flash)
    this.industries.forEach((it) => {
      const a = new Image(); a.src = it.heroBg;
      const b = new Image(); b.src = it.heroProduct;
    });
  }

  // useLanguage(lang: any) {
  //   const code = typeof lang === 'string' ? lang : lang?.code;
  //   console.log('lang ', code);
  //   this.languageService.useLanguage(code);
  // }

  useLanguage(lang) {
    this.changingLang = true;
    this.languageService.useLanguage(lang);
    this.getLanguage();
    this.changingLang = false;
  }

  selectIndustry(i: number) {
    if (!this.isBrowser) return;
    if (i === this.selected) return;

    this.prevBg = this.industries[this.selected].heroBg;
    this.selected = i;
    this.heroKey++; // retrigger text/product entrance animation

    this.bgFading = true;
    window.setTimeout(() => {
      this.bgFading = false;
      this.prevBg = null;
    }, 520);
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

  toggleCard(i: number) {
    this.activeCard = this.activeCard === i ? -1 : i;
    this.selectIndustry(i);
    console.log(this.activeCard);
  }

  toggleChangeLanguage() {
    this.selectedLanguage = this.selectedLanguage === 'en' ? 'fr' : 'en';
    this.useLanguage(this.selectedLanguage);
  }

  onCardEnter(el: HTMLElement) {
    this.hoveredCardEl = el;
  }
  onCardLeave() {
    this.hoveredCardEl = null;
    this.pendingEvt = null;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }
  onCardMove(evt: PointerEvent) {
    if (!this.hoveredCardEl) return;
    this.pendingEvt = evt;
    if (this.rafId) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      if (!this.pendingEvt || !this.hoveredCardEl) return;

      const r = this.hoveredCardEl.getBoundingClientRect();
      const x = ((this.pendingEvt.clientX - r.left) / r.width) * 100;
      const y = ((this.pendingEvt.clientY - r.top) / r.height) * 100;
      this.hoveredCardEl.style.setProperty('--mx', `${x}%`);
      this.hoveredCardEl.style.setProperty('--my', `${y}%`);
    });
  }

  toggleFaq(i: number) {
    this.openFaq = this.openFaq === i ? null : i;
  }

  
}
