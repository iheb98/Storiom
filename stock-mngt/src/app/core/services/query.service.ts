import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  constructor() { }

  buildQuery(...query){
    console.log(query)
  }
}
