import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast/toast.service';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  private lastErrorFingerprint = '';
  private lastErrorAt = 0;

  constructor(private toastService: ToastService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!this.shouldSkipToast(request)) {
          const message = this.buildErrorMessage(error, request.url);
          this.presentErrorToastOnce(message, request.url, error.status);
        }
        return throwError(() => error);
      }),
    );
  }

  private shouldSkipToast(request: HttpRequest<unknown>): boolean {
    const skipByHeader = request.headers.get('x-skip-error-toast') === 'true';
    const isAssetRequest = request.url.includes('/assets/');
    return skipByHeader || isAssetRequest;
  }

  private presentErrorToastOnce(message: string, url: string, status: number): void {
    const now = Date.now();
    const fingerprint = `${status}|${url}|${message}`;
    const isDuplicate =
      this.lastErrorFingerprint === fingerprint && now - this.lastErrorAt < 2500;

    if (isDuplicate) {
      return;
    }

    this.lastErrorFingerprint = fingerprint;
    this.lastErrorAt = now;
    this.toastService.presentToast('error', 'Request failed', message, 7000);
  }

  private buildErrorMessage(error: HttpErrorResponse, url: string): string {
    if (!error) {
      return 'Unknown error occurred.';
    }

    if (error.status === 0) {
      return 'Unable to reach server. Please check your network connection.';
    }

    if (this.isLoginRequest(url) && error.status === 401) {
      return 'Incorrect email/phone or password.';
    }

    const backendMessage = this.extractBackendMessage(error);
    if (backendMessage) {
      return backendMessage;
    }

    switch (error.status) {
      case 400:
        return 'Invalid request data. Please verify your input and try again.';
      case 401:
        return 'Authentication required or session expired. Please login again.';
      case 403:
        return 'Access denied for this action.';
      case 404:
        return 'Requested resource was not found.';
      case 409:
        return 'Conflict detected. The resource may already exist.';
      case 422:
        return 'Submitted data is not valid.';
      case 429:
        return 'Too many requests. Please try again in a moment.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please retry later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  private isLoginRequest(url: string): boolean {
    return url.includes('/auth/signin');
  }

  private extractBackendMessage(error: HttpErrorResponse): string | null {
    const payload = error.error;

    if (!payload) {
      return null;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (Array.isArray(payload?.message)) {
      return payload.message.filter(Boolean).join(' | ');
    }

    if (typeof payload?.message === 'string') {
      return payload.message;
    }

    if (typeof payload?.error === 'string') {
      return payload.error;
    }

    if (typeof payload?.details === 'string') {
      return payload.details;
    }

    return null;
  }
}

