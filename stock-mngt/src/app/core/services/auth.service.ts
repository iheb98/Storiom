import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedIn = new ReplaySubject<void>(1)

  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/users/';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  getUser(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'profile/' + id);
  }


  registerUser(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'register', body);
  }

  updateUser(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  login(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'authenticate', body);
  }

  registerTokens(accessToken, refreshToken) {
    if (accessToken)
      localStorage.setItem('accessToken', accessToken);
    if (refreshToken)
      localStorage.setItem('refreshToken', refreshToken);
  }

  refreshToken() {
    return this.http.post<any>(this.baseUrl + 'token', { token: localStorage.getItem('refreshToken') });
  }

  isLoggedIn() {
    return !!localStorage.getItem('accessToken') && localStorage.getItem('accessToken') != 'undefined'
  }

  getUserRole() {
    let jwt = localStorage.getItem("accessToken");
    jwt = jwt.substring(4)
    let jwtData = jwt.split('.')[1]
    let decodedJwtJsonData = window.atob(jwtData)
    let decodedJwtData = JSON.parse(decodedJwtJsonData)
    return decodedJwtData.role
  }

  getConnectedUser() {
    let jwt = localStorage.getItem("accessToken");
    if (jwt == null) return null;
    jwt = jwt.substring(4)
    let jwtData = jwt.split('.')[1]
    let decodedJwtJsonData = window.atob(jwtData)
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    return decodedJwtData;
  }

  hasAStore(id) {
    return this.http.get<any>(this.baseUrl + 'hasAStore/' + id);
  }

  logout() {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { token: localStorage.getItem('refreshToken') },
    };
    return this.http.delete<any>(this.baseUrl + 'logout', options);
  }

  checkSubscription(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'checkSubscription/' + id);
  }

  getSubscriptionDetails(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'subscription/' + id);
  }

  forgotPassword(body): Observable<any> {
    return this.http.post(this.baseUrl + 'forgot-password', body);
  }

  resetPassword(body): Observable<any> {
    return this.http.post(this.baseUrl + 'reset-password', body);
  }

  confirmAccount(token): Observable<any> {
    return this.http.get(this.BASE_PATH + '/confirm', {
      params: {
        token
      }
    });
  }
}

