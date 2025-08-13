import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  Event,
  ActivatedRoute,
} from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { SpinnerService } from './core/core.index';
import { SystemService } from './services/system/system.service';
import { StorageService } from './services/storage/storage.service';
import { MetaService } from './services/meta/meta.service';
import { LanguageService } from './services/language/language.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  countriesList: any;
  citiesList: any;
  categoriesList: any;
  url: string;
  isTermsPage: boolean = false;
  networkError: boolean = false;
  idrate: boolean = false;

  constructor(
    private systemService: SystemService,
    private router: Router,
    private location: Location,
    private storage: StorageService,
    private metaTag: MetaService,
    private language: LanguageService,
    private route: ActivatedRoute,
  ) {
    this.language.initLanguage();

    this.metaTag.setDefaultMetatag();
    this.route.paramMap.subscribe((params) => {
      this.getId();
      this.loadStaticData();
    });
  }

  /**
   * Initializes the app component and sets the status bar background color.
   */
  async ngOnInit() {
    // this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
    //   this.getId();
    //   this.loadStaticData();
    // });
  }

  /**
   * Loads static data (e.g., countries, cities, categories) using the system service.
   * @returns A promise that resolves when the static data is loaded and optionally saved in storage.
   */
  async loadStaticData() {
    this.systemService
      .getStaticData()
      .then((staticData) => {
        // Example: Save data in storage for later use
        // this.storage.setStorage('staticData', JSON.stringify(staticData));
      })
      .catch((error) => console.error('Error loading static data:', error));
  }

  getId() {
    this.url = this.location.path();
    this.isTermsPage = this.url.endsWith('terms');
    // console.log("isTermsPage: ", this.isTermsPage)
  }

  checkNetwork() {
    setTimeout(() => {
      if (this.idrate) {
        this.networkError = false;
      } else {
        this.networkError = true;
        this.checkNetwork();
      }
    }, 8000)
  }
  /**
   * Cleans up data when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
