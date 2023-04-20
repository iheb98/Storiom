import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/';

  constructor(private http: HttpClient) { }

  uploadFile(file): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'uploadFile', file);
  }

}
