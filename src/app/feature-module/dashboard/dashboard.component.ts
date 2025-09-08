import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { routes, SideBarService } from 'src/app/core/core.index';
import { ExchangeService } from 'src/app/services/exchange/exchange.service';
import { LocationService } from 'src/app/services/location/location.service';
import { SoldeService } from 'src/app/services/solde/solde.service';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  yaxis: ApexYAxis | any;
  xaxis: ApexXAxis | any;
  fill: ApexFill | any;
  tooltip: ApexTooltip | any;
  stroke: ApexStroke | any;
  legend: ApexLegend | any;
  title: ApexTitleSubtitle | any;
  colors: string[] | any;
  subtitle: ApexTitleSubtitle | any;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentUserData!: any;
  userName: string = 'User';
  public routes = routes;
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions>;
  public chartOptions3: Partial<ChartOptions>;

  public chartOptions4: Partial<ChartOptions>;
  public chartOptions5: Partial<ChartOptions>;
  public layoutPosition = '1';
  gettingUserStats: boolean = false;
  public userStats: any = {
    usersNumber: 0,
    pourcentage: 0,
  };
  gettingExchangeRate: boolean = false;
  exchangeRate: any = [];
  allCountries: any = [];
  availableCountries: any = [];
  otherCountries: any = [];
  gettingLocations: boolean = true;
  networkError: boolean = false;
  transactionList: any = [];
  waittingSolde: boolean = true;
  solde: number = 0;
  plansStats: any = 0;
  gettingPlansStats: boolean = true;

  constructor(
    private sideBar: SideBarService,
    private userService: UserService,
    private planService: SubscriptionService,
    private router: Router,
    private route: ActivatedRoute,
    private location: LocationService,
    private systemService: SystemService,
    private exchange: ExchangeService,
    private soldeService: SoldeService,
  ) {}

  async ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.scrollToTop();
      this.getUserData();
      this.initCharts();
    });
    this.checkNetwork();
  }

  getSolde(){
    this.waittingSolde = true;
    this.soldeService.getSolde()
    .subscribe((data: any) => {
      this.solde = data ? data.solde : 0;
      this.waittingSolde = false
    })
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

  async getUserData() {
    await this.userService
      .getCurrentUser()
      .then(
        (userData) => {
          if (!userData) {
            this.navigateTo('/auth-screen');
            return;
          }
          this.currentUserData = userData;
          if (this.currentUserData) {
            this.userName = this.userService.showName(this.currentUserData);
            this.userName = this.userName.split(' ')[0]; // Get only the first name
            if (this.currentUserData.isAdmin === true) {
              this.gettingUserStats = true;
              this.userStats = this.getUsersStatistics();
              this.plansStats = this.getPlansStatistics();
            }
          }
          this.getSolde();
          this.getExchangeRate();
          this.getLocations();
        },
        (e) => {
          console.log('error to get current User: ', e);
        },
      )
      .catch((e) => {
        this.currentUserData = undefined;
      });
  }

  async getUsersStatistics() {
    try {
      const response = await this.userService.getUsersStatistics();
      if (response) {
        this.userStats = response;
        this.gettingUserStats = false;
      } else {
        console.error('No data found in response');
        this.gettingUserStats = false;
      }
    } catch (error) {
      console.error('Error fetching users stats:', error);
      this.gettingUserStats = false;
    }
  }

  async getPlansStatistics(){
    try {
      const response = await this.planService.getPlansStatistics();
      if (response) {
        this.plansStats = response;
        this.gettingPlansStats = false;
      } else {
        console.error('No data found in response');
        this.gettingPlansStats = false;
      }
    } catch (error) {
      console.error('Error fetching plans stats:', error);
      this.gettingPlansStats = false;
    }
  }

  navigateTo(location) {
    this.router.navigate([location]); // Directs to the authentication screen for login.
  }

  private getExchangeRate() {
    this.gettingExchangeRate = true;
    this.exchange
      .getOtherExchangeRate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          if (data) {
            this.exchangeRate = data;
          } else {
            console.error('Failed to fetch exchange rate data');
          }
          setTimeout(() => {
          this.gettingExchangeRate = false;
          }, 3000)
        },
        (error) => {
          setTimeout(() => {
          this.gettingExchangeRate = false;
          }, 3000)
          console.error('Error fetching exchange rate:', error);
        },
      );
  }

  exchangeTo(currency) {
    let data: any = this.exchangeRate.filter((e) => e.toCurrency === currency);
    data = data[0];
    return data.value;
  }

  /**
   * Retrieves and sets available countries and cities for the form.
   */
  getLocations() {
    this.location
      .getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => {
        if (countries) {
          this.allCountries = countries.sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          this.availableCountries = this.allCountries.filter(
            (e) => e.status === true,
          );
          this.otherCountries = this.availableCountries.filter(
            (e) => e._id != this.currentUserData.countryId._id,
          );
          this.location
            .getCities()
            .pipe(takeUntil(this.destroy$))
            .subscribe((cities) => {
              this.gettingLocations = false;
              return;
            });
        } else {
          this.systemService.getStaticData().then(() => {
            setTimeout(() => {
              this.getLocations();
              window.location.reload();
            }, 10 * 1000);
          });
        }
      });
  }

  checkNetwork() {
    setTimeout(() => {
      if (this.userService && this.allCountries) {
        this.networkError = false;
      } else {
        this.networkError = true;
        this.checkNetwork();
      }
    }, 20000);
  }

  /**
   * Cleans up data when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCharts() {
    this.chartOptions = {
      series: [
        {
          name: 'Earnings ',
          data: [
            {
              x: 'Jan',
              y: 40,
            },
            {
              x: 'Feb',
              y: 38,
            },
            {
              x: 'Mar',
              y: 50,
            },
            {
              x: 'Apr',
              y: 85,
            },
            {
              x: 'May',
              y: 55,
            },
            {
              x: 'Jun',
              y: 45,
            },
            {
              x: 'Jul',
              y: 60,
            },
            {
              x: 'Aug',
              y: 40,
            },
            {
              x: 'Sep',
              y: 43,
            },
            {
              x: 'Oct',
              y: 30,
            },
            {
              x: 'Nov',
              y: 65,
            },
            {
              x: 'Dec',
              y: 50,
            },
          ],
        },
      ],
      chart: {
        type: 'bar',
        height: 250,
      },
      plotOptions: {
        bar: {
          columnWidth: '70%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'category',
        group: {
          style: {
            fontSize: '7px',
            fontWeight: 700,
          },
        },
      },
      fill: {
        colors: ['#021d66'],
      },
    };
    this.chartOptions2 = {
      series: [
        {
          name: 'Companies',
          data: [25, 40, 30, 55, 25, 35, 25, 50, 20],
        },
      ],
      chart: {
        height: 273,
        type: 'area',
        zoom: {
          enabled: false,
        },
      },
      fill: {
        colors: ['#FF9F43'],
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
        colors: ['#FF9F43'],
      },
      title: {
        text: '',
        align: 'left',
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
      },
      yaxis: {
        min: 10,
        max: 60,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => {
            return val / 1 + 'K';
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
    };
    this.chartOptions3 = {
      series: [
        {
          data: [400, 325, 312, 294, 254, 252],
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
      },
      plotOptions: {
        bar: {
          barHeight: '100%',
          distributed: true,
          horizontal: true,
        },
      },
      colors: [
        '#FFEFDD',
        '#EADDFF',
        '#DDF3FF',
        '#FFECEC',
        '#E1FFED',
        '#E0E0E0',
      ],
      dataLabels: {
        enabled: true,
        textAnchor: 'end',
        margin: 10,
        style: {
          colors: ['#1D1D1D'],
        },
        formatter: function (val: string, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
        },
        offsetX: 0,
        dropShadow: {
          enabled: true,
        },
      },
      stroke: {
        width: 0,
        colors: ['#1D1D1D'],
      },
      xaxis: {
        categories: [
          'Sales : $6,100,00',
          'Sales : $5,100,00',
          'Sales : $4,200,00',
          'Sales : $3,400,00',
          'Sales : $3,400,00',
          'Sales : $400,00',
        ],
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: function () {
              return '';
            },
          },
        },
      },
    };
    this.chartOptions4 = {
      series: [
        {
          name: 'Received',
          data: [70, 150, 80, 180, 150, 175, 201, 60, 200, 120, 190, 160, 50],
          colors: ['#021d66'],
        },

        {
          name: 'Pending',
          data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16, 80],
          colors: ['#fda600'],
        },
      ],

      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 5,
          borderRadiusOnAllStackedSeries: true,
          borderRadiusApplication: 'end',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        markers: {
          fillColors: ['#7638ff', '#fda600'],
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: [
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
        ],
      },
      yaxis: {
        title: {
          text: '$ (thousands)',
        },
      },
      fill: {
        opacity: 1,
        colors: ['#7638ff', '#fda600'],
      },
      tooltip: {
        y: {
          formatter: function (val: string) {
            return '$ ' + val + ' thousands';
          },
        },
      },
    };

    // <* to check layout position *>
    this.sideBar.layoutPosition.subscribe((res) => {
      this.layoutPosition = res;
    });
  }
}
