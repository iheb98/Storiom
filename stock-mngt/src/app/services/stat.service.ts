import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatService {


  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/stats/';

  constructor(private http: HttpClient) { }

  getWidgets(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/widgets');
  }

}
