import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/workers/';

  constructor(private http: HttpClient) { }

  getWorkersByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id, {
      params: {
        ...query
      }
    });
  }

  getAllWorkersByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'all/store/' + id);
  }

  countWorkersByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'count/store/' + id,
      {
        params: {
          ...query
        }
      });
  }

  getWorker(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }




  addWorker(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateWorker(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  deleteWorker(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}
