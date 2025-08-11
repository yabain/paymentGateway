import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { ToastService } from '../toast.service';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  /** Current date for timestamp generation */
  now = new Date();

  constructor(
    private toastService: ToastService,
    private apiService: ApiService,
  ) { }


  /**
   * Creates a notification for each follower when an event is created.
   * 
   * @param eventId - The unique identifier of the event
   * @param event - Event details
   */
  async createEventNotifToFollowers(eventId: string, eventData?: any): Promise<void> {
  }

  /**
   * Deletes a specified notification.
   * 
   * @param userId - User's Id
   * @param notifId - notification's Id
   * @returns Observable with the deletion status
   */
  async deleteNotification(userId: any, notifId: string): Promise<any> {
  }

  /**
   * Retrieves a list of unread notifications for the specified user.
   * Only includes notifications where the 'read' property is false.
   * 
   * @param userId - The user's ID
   * @returns Observable with unread notifications
   */
  getMyUnreadedNotifs(): Observable<any> {
    return this.apiService.getWithToken(`notification/unreaded-notifications`);
  }

  /**
   * Retrieves the list of notifications for the specified user.
   * 
   * @param userId - The user's ID
   * @returns Observable with the user's notifications
   */
  getMyNotifList(): Observable<any> {
    return this.apiService.getWithToken(`notification/my-notifications`);
  }

  /**
   * Changes the status of a notification to 'read'.
   * 
   * @param userId - The user's ID
   * @param notifId - The notification ID
   * @returns Observable with the status change confirmation
   */
  changeNotifStatus(notifId: string): Observable<any> {
    return from(this.apiService.update(`notification`, notifId, { isReaded: true}))
    .pipe(
      map(() => ({ message: 'Notification marked as read!' })),
      catchError(error => of({ error }))
    );
  }

  /**
 * Sorts notifications from the most recent to the oldest based on creation date.
 * 
 * @param notifications - Array of notification objects, each with an 'id' property
 * @returns Array of sorted notifications (most recent first)
 */
  sortNotificationsByDate(notifications: any[]): { id: string }[] {
    return notifications.sort((a, b) => {
      // Extract the date string from each notification's id
      const dateA = new Date(a.id.split('-notif-')[0]);
      const dateB = new Date(b.id.split('-notif-')[0]);

      // Compare dates in descending order (most recent first)
      return dateB.getTime() - dateA.getTime();
    });
  }
}
