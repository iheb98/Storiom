import { HTTP_INTERCEPTORS, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, filter, switchMap, take, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';

const TOKEN_HEADER_KEY = 'x-access-token';    // for Node.js Express back-end

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // Timeout for refresh token request (15 seconds)
  private readonly REFRESH_TIMEOUT = 15000;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
    let authReq = req;
    const token = localStorage.getItem('accessToken');
    if (token != null) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse) {
        // 402 = subscription expired — don't logout, redirect to subscription page
        if (error.status === 402 && error.error?.subscriptionExpired) {
          this.router.navigate(['/admin/subscription']);
          return throwError(error);
        }

        // Only handle 403 errors (token expired) for non-auth endpoints
        if (!authReq.url.includes('authenticate') &&
          !authReq.url.includes('/token') &&
          error.status === 403) {
          return this.handle403Error(authReq, next);
        }
      }

      return throwError(error);
    }));
  }

  private handle403Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');

      // If no refresh token exists, logout immediately
      if (!refreshToken) {
        this.handleLogout();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.authService.refreshToken().pipe(
        // Add timeout to prevent hanging forever
        timeout(this.REFRESH_TIMEOUT),
        switchMap((response: any) => {
          this.isRefreshing = false;

          if (response && response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            this.refreshTokenSubject.next(response.accessToken);
            return next.handle(this.addTokenHeader(request, response.accessToken));
          } else {
            // Invalid response from refresh endpoint
            this.handleLogout();
            return throwError(() => new Error('Invalid refresh response'));
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);

          // If refresh fails, logout the user
          this.handleLogout();
          return throwError(() => err);
        })
      );
    }

    // If already refreshing, wait for the new token with a timeout
    return this.refreshTokenSubject.pipe(
      // Filter out null (waiting state) and wait for actual token
      filter(token => token !== null),
      take(1),
      // Add timeout to prevent infinite wait
      timeout(this.REFRESH_TIMEOUT),
      switchMap((token) => next.handle(this.addTokenHeader(request, token))),
      catchError((err) => {
        // If waiting times out, reset state and try to proceed
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  private handleLogout() {
    // Clear all tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Reset state
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);

    // Redirect to login
    this.router.navigate(['/login']);
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
  }
}