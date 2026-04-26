import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface StoreTheme {
  primaryColor: string;
  accentColor: string;
  mode: 'light' | 'dark';
  fontFamily: string;
}

export interface DomainStore {
  id: number;
  name: string;
  description: string;
  logo: string;
  images: string[];
  phone: string;
  email: string;
  site: string;
  theme: StoreTheme;
  address: any;
  isSupportingDeliveries: boolean;
}

export interface DomainResolution {
  isDomainStore: boolean;
  store: DomainStore | null;
}

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private apiUrl = environment.apiUrl + '/public';

  // Platform domains that are NOT custom store domains
  private platformDomains = ['storiom.com', 'www.storiom.com', 'localhost', '127.0.0.1', '161.97.186.60'];

  private _isCustomDomain = new BehaviorSubject<boolean>(false);
  private _currentStore = new BehaviorSubject<DomainStore | null>(null);
  private _storeTheme = new BehaviorSubject<StoreTheme | null>(null);
  private _resolved = new BehaviorSubject<boolean>(false);

  /** Whether we're on a custom store domain */
  isCustomDomain$ = this._isCustomDomain.asObservable();

  /** The resolved store (null if on the main platform) */
  currentStore$ = this._currentStore.asObservable();

  /** The store's theme (null if on the main platform) */
  storeTheme$ = this._storeTheme.asObservable();

  /** Whether domain resolution has completed */
  resolved$ = this._resolved.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Call this on app initialization (APP_INITIALIZER).
   * Detects if we're on a custom domain and resolves the store.
   */
  initialize(): Promise<void> {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const hostWithPort = port ? `${hostname}:${port}` : hostname;

    // Check if this is a platform domain
    if (this.isPlatformDomain(hostname)) {
      this._isCustomDomain.next(false);
      this._currentStore.next(null);
      this._storeTheme.next(null);
      this._resolved.next(true);
      return Promise.resolve();
    }

    // It's a custom domain — resolve it
    return this.http.get<DomainResolution>(`${this.apiUrl}/resolve-domain`, {
      params: { host: hostname }
    }).pipe(
      tap(result => {
        if (result.isDomainStore && result.store) {
          this._isCustomDomain.next(true);
          this._currentStore.next(result.store);
          this._storeTheme.next(result.store.theme || null);
          this.applyStoreTheme(result.store.theme, result.store.name);
        } else {
          this._isCustomDomain.next(false);
          this._currentStore.next(null);
          this._storeTheme.next(null);
        }
        this._resolved.next(true);
      }),
      catchError(err => {
        console.error('Domain resolution failed:', err);
        this._isCustomDomain.next(false);
        this._resolved.next(true);
        return of(null);
      })
    ).toPromise().then(() => { });
  }

  /** Synchronous access to current state */
  get isCustomDomain(): boolean {
    return this._isCustomDomain.value;
  }

  get currentStore(): DomainStore | null {
    return this._currentStore.value;
  }

  get storeId(): number | null {
    return this._currentStore.value?.id || null;
  }

  /**
   * Apply the store's theme as CSS custom properties on the document root.
   * Components can use these variables for styling.
   */
  private applyStoreTheme(theme: any, storeName?: string): void {
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--store-primary', theme.primaryColor || '#4f46e5');
    root.style.setProperty('--store-accent', theme.accentColor || '#f59e0b');
    root.style.setProperty('--store-font', theme.fontFamily || 'Inter');

    if (theme.mode === 'dark') {
      root.classList.add('store-dark-mode');
    } else {
      root.classList.remove('store-dark-mode');
    }

    // Set tab title immediately (before any component renders)
    const tabTitle = theme.browserTab?.title || storeName || '';
    if (tabTitle) {
      document.title = tabTitle;
    }

    // Set favicon immediately
    const favicon = theme.browserTab?.favicon;
    if (favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = environment.backend + '/' + favicon;
    }
  }

  private isPlatformDomain(hostname: string): boolean {
    return this.platformDomains.includes(hostname);
  }
}
