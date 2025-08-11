import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';

declare const gapi: any;
declare const google: any;

export interface GoogleCalendarEvent {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  private readonly CLIENT_ID = environment.CLIENT_ID;
  private readonly CLIENT_ID_MOBILE = environment.CLIENT_ID_MOBILE;
  private readonly API_KEY = environment.API_KEY;
  private readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private readonly SCOPES = 'https://www.googleapis.com/auth/calendar';

  private gapiLoaded = new BehaviorSubject<boolean>(false);
  private tokenClient: any;
  private gapiInited = false;
  private gisInited = false;

  constructor(private platform: Platform) {
    this.initializeGoogleAPIs();
  }

  public isGapiLoaded(): Observable<boolean> {
    return this.gapiLoaded.asObservable();
  }

  private async initializeGoogleAPIs(): Promise<void> {
    try {
      // Vérifier si les objets gapi et google sont disponibles
      if (typeof gapi === 'undefined' || typeof google === 'undefined') {
        console.error('Google APIs not loaded');
        throw new Error('Google APIs not available');
      }

      // Initialize the gapi.client
      await this.initializeGapiClient();

      // Initialize the Google Identity Services
      // const isMobile = this.platform.is('android') || this.platform.is('ios');
      let isMobile: boolean = false;
      if (environment.plateforme === 'mobile') {
        isMobile = true;
      }
      const clientId = isMobile ? this.CLIENT_ID_MOBILE : this.CLIENT_ID;

      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: this.SCOPES,
        callback: '', // defined later
      });

      this.gisInited = true;
      this.maybeEnableButtons();
    } catch (error) {
      console.error('Error initializing Google APIs:', error);
      throw new Error('Failed to initialize Google APIs');
    }
  }

  private async initializeGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') {
        reject(new Error('gapi not loaded'));
        return;
      }

      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: [this.DISCOVERY_DOC],
          });
          this.gapiInited = true;
          this.maybeEnableButtons();
          resolve();
        } catch (error) {
          console.error('Error initializing gapi client:', error);
          reject(error);
        }
      });
    });
  }

  private maybeEnableButtons(): void {
    if (this.gapiInited && this.gisInited) {
      this.gapiLoaded.next(true);
    }
  }

  public async signIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          console.error('Token client not initialized');
          reject(new Error('Token client not initialized'));
          return;
        }

        if (!this.gapiInited || !this.gisInited) {
          console.error('Google APIs not fully initialized');
          reject(new Error('Google APIs not fully initialized'));
          return;
        }

        this.tokenClient.callback = async (response: any) => {
          if (response.error) {
            console.error('Sign in error:', response.error);
            reject(response.error);
            return;
          }
          await this.listUpcomingEvents();
          resolve();
        };

        if (gapi.client.getToken() === null) {
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (error) {
        console.error('Error during sign in:', error);
        reject(error);
      }
    });
  }

  public async signOut(): Promise<void> {
    try {
      const token = gapi.client.getToken();
      if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  private async listUpcomingEvents(maxResults: number = 10): Promise<any> {
    try {
      const response = await gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': new Date().toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': maxResults,
        'orderBy': 'startTime',
      });
      return response.result.items;
    } catch (error) {
      console.error('Error listing events:', error);
      throw error;
    }
  }

  public async createEvent(event: GoogleCalendarEvent): Promise<any> {
    try {
      if (!gapi.client.getToken()) {
        throw new Error('Not signed in to Google Calendar');
      }

      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      // console.log('Event created successfully:', response.result);
      return response.result;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  public async updateEvent(eventId: string, event: Partial<GoogleCalendarEvent>): Promise<any> {
    try {
      if (!gapi.client.getToken()) {
        throw new Error('Not signed in to Google Calendar');
      }

      const response = await gapi.client.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      console.log('Event updated successfully:', response.result);
      return response.result;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  public async deleteEvent(eventId: string): Promise<void> {
    try {
      if (!gapi.client.getToken()) {
        throw new Error('Not signed in to Google Calendar');
      }

      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      console.log('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
  // Exemple dans google-calendar.service.ts

  async ensureSignedIn(): Promise<boolean> {
    try {
      // Chec if the user is already signed in
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      if (user.isSignedIn()) {
        console.error('Google already sign-in');
        return true;
      }
      // else, prompt the user to sign in
      // await gapi.auth2.getAuthInstance().signIn();
      // console.error('Google sign-in Successful');
      console.error('Google not sign-in');
      return false;
    } catch (error) {
      console.error('Error: Google not sign-in', error);
      return false;
    }
  }

}
