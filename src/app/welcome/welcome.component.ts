import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LanguageService } from '../services/language/language.service';

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
export class WelcomeComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private isBrowser: boolean;
  appName: string = environment.appName;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private languageService: LanguageService) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  year = new Date().getFullYear();


  lang = [
    { name: 'En', flag: 'assets/icons/uk-flag.svg', code: 'en' },
    { name: 'Fr', flag: 'assets/icons/fr-flag.svg', code: 'fr' },
  ];
  selectedLang = this.lang[0];

  logo = [
    { name: 'logo', link: 'assets/img/resources/dk_logo.png', alt: this.appName },
    { name: 'icon', link: 'assets/img/resources/icon.jpg', alt: this.appName },
  ];
  nav = [
    { label: 'Home', route: '/welcome' },
    { label: 'Services', route: '/solutions' },
    { label: 'Company', route: '/company' },
    { label: 'Resources', route: '/resources' },
    { label: 'Contact Us', route: '/contact' },
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
      route: '/industries/transfer',
    },
    {
      key: 'subscriptionPlan',
      title: 'welcome.subscriptionPlan.title',
      heroTitle: 'welcome.subscriptionPlan.subtitle',
      heroBg: '../../assets/img/resources/bg.webp',
      heroProduct: 'assets/welcome/hero-tray.webp',
      blurb: 'welcome.subscriptionPlan.description',
      route: '/industries/plans',
    },
    {
      key: 'fundraising',
      title: 'welcome.fundraising.title',
      heroTitle: 'welcome.fundraising.subtitle',
      heroBg: '../../assets/img/resources/fundraising_bg.webp',
      heroProduct: 'assets/welcome/hero-produce.webp',
      blurb: 'welcome.fundraising.description',
      route: '/industries/fundraising',
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

  // Certifications (comme sur ta frame)
  certLeft = [
    'GRS',
    'DIN CERTCO',
    'TÜV OK Compost Industrial',
    'ISO 14001',
    'ISO 45001',
  ];
  certRight = [
    'BPI',
    'TÜV OK Compost Home',
    'ISO 9001',
    'ISO 22000',
    'FSSC 22000',
  ];

  // FAQ (comme la page)
  faqs = [
    { q: 'What types of packaging do you offer?', a: 'Food service, processing and agriculture formats + selected custom options.' },
    { q: 'Do you deliver nationwide?', a: 'Yes. Timelines depend on region and stock availability.' },
    { q: 'Do you deliver globally?', a: 'Global supply is possible through partner logistics depending on product and volume.' },
    { q: 'How do I place an order?', a: 'Shop online or contact sales for bulk/custom quotes.' },
    { q: 'Do you offer tailored packaging solutions?', a: 'Yes. We can propose alternatives by use-case, compliance and budget.' },
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

  useLanguage(lang: any) {
    const code = typeof lang === 'string' ? lang : lang?.code;
    console.log('lang ', code);
    this.languageService.useLanguage(code);
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

  toggleCard(i: number) {
    this.activeCard = this.activeCard === i ? -1 : i;
    this.selectIndustry(i);
    console.log(this.activeCard);
  }

  toggleChangeLanguage() {
    this.selectedLang = this.selectedLang.code === 'en' ? this.lang[1] : this.lang[0];
    this.useLanguage(this.selectedLang.code);
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

  scrollTop() {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
