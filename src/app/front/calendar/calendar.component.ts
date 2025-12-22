import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnChanges, OnInit, OnDestroy {

  @Input() events: {
    title: string;
    dateStart: string;
    dateEnd: string;
    color?: string;
  }[] = [];
  months: string = '';
  days: string = '';
  week: string = '';
  years: string = '';
  toDay: string = 'Today';
  private langChangeSubscription?: Subscription;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,dayGridMonth,dayGridYear'
    },
    buttonText: {
      today: 'Today',
      month: 'Month',
      day: 'Day',
      year: 'Year',
      week: 'Week',
      dayGridMonth: 'Month',
      timeGridDay: 'Day',
      dayGridYear: 'Year'
    },
    events: [],
    height: 'auto',
    fixedWeekCount: false,
    displayEventTime: false
  };

  constructor(
    private translate: TranslateService,
  ){}

  ngOnInit(): void {
    this.getLabelInCurrentLanguage();
    // Écouter les changements de langue
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.getLabelInCurrentLanguage();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  ngOnChanges(): void {
    this.calendarOptions.events = this.events.map(event => ({
      title: event.title,
      start: event.dateStart,
      end: event.dateEnd,
      backgroundColor: event.color,
      borderColor: event.color
    }));
  }

  getLabelInCurrentLanguage(){
    forkJoin({
      today: this.translate.get("subscriptions.today"),
      day: this.translate.get("subscriptions.day"),
      month: this.translate.get("subscriptions.month"),
      year: this.translate.get("subscriptions.year"),
      week: this.translate.get("subscriptions.week")
    }).subscribe((translations: any) => {
      this.toDay = translations.today;
      this.days = translations.day;
      this.months = translations.month;
      this.years = translations.year;
      this.week = translations.week;
      
      // Mettre à jour calendarOptions après avoir récupéré les traductions
      // Recréer complètement l'objet pour que Angular détecte le changement
      this.calendarOptions = {
        ...this.calendarOptions,
        buttonText: {
          today: translations.today,
          month: translations.month,
          day: translations.day,
          year: translations.year,
          week: translations.week,
          dayGridMonth: translations.month,
          timeGridDay: translations.day,
          dayGridYear: translations.year
        }
      };
    });
  }
}
