import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = false;
  constructor() { }

  screenLoading() {
    this.loading = true;
  }

  screenLoaded() {
    this.loading = false;
  }

  isScreenLoading() {
    return this.loading;
  }
}
