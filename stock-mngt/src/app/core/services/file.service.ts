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

  uploadMultiple(files): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'uploadMultipleFiles', files);
  }

  deleteFile(filename: string): Observable<any> {
    return this.http.delete<any>(this.baseUrl + 'deleteFile', { body: { filename } });
  }

  getFileInfo(filename: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'getFileInfo/' + encodeURIComponent(filename));
  }

}
