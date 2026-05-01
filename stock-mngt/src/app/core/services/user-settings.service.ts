import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface UserSettings {
    theme: {
        primaryColor: string;
        mode: 'light' | 'dark';
    };
    defaults: {
        productVisibleToPublic: boolean;
        productToDisplay: boolean;
        showBuyingPrice: boolean;
    };
    navigation: {
        defaultScreen: 'none' | 'dashboard' | 'products' | 'orders' | 'stats';
    };
}

const DEFAULT_SETTINGS: UserSettings = {
    theme: {
        primaryColor: '#3f51b5',
        mode: 'light'
    },
    defaults: {
        productVisibleToPublic: true,
        productToDisplay: true,
        showBuyingPrice: false
    },
    navigation: {
        defaultScreen: 'none'
    }
};

@Injectable({
    providedIn: 'root'
})
export class UserSettingsService {
    private apiUrl = environment.apiUrl + '/users';
    private settingsSubject = new BehaviorSubject<UserSettings>(DEFAULT_SETTINGS);
    private settingsLoadedSubject = new BehaviorSubject<boolean>(false);

    settings$ = this.settingsSubject.asObservable();
    settingsLoaded$ = this.settingsLoadedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        // Load settings when service is initialized
        this.loadSettings();
    }

    get currentSettings(): UserSettings {
        return this.settingsSubject.value;
    }

    get isLoaded(): boolean {
        return this.settingsLoadedSubject.value;
    }

    loadSettings(): void {
        // Reset loaded state before loading new settings
        this.settingsLoadedSubject.next(false);

        const user = this.authService.getConnectedUser();
        if (user?.id) {
            this.getSettings(user.id).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.settingsSubject.next({ ...DEFAULT_SETTINGS, ...res.settings });
                        this.settingsLoadedSubject.next(true);
                    }
                },
                error: () => {
                    // Use defaults on error
                    this.settingsSubject.next(DEFAULT_SETTINGS);
                    this.settingsLoadedSubject.next(true);
                }
            });
        } else {
            this.settingsLoadedSubject.next(true);
        }
    }

    getSettings(userId: number): Observable<{ success: boolean; settings: UserSettings }> {
        return this.http.get<{ success: boolean; settings: UserSettings }>(
            `${this.apiUrl}/${userId}/settings`
        );
    }

    updateSettings(userId: number, settings: Partial<UserSettings>): Observable<{ success: boolean; settings: UserSettings; message: string }> {
        return this.http.put<{ success: boolean; settings: UserSettings; message: string }>(
            `${this.apiUrl}/${userId}/settings`,
            { settings }
        ).pipe(
            tap(res => {
                if (res.success) {
                    this.settingsSubject.next(res.settings);
                }
            })
        );
    }

    // Helper method to update theme
    updateTheme(primaryColor: string, mode: 'light' | 'dark'): Observable<any> {
        const user = this.authService.getConnectedUser();
        if (!user?.id) return new Observable(observer => observer.error('No user'));

        return this.updateSettings(user.id, {
            theme: { primaryColor, mode }
        });
    }

    // Helper method to update defaults
    updateDefaults(productVisibleToPublic: boolean, productToDisplay: boolean, showBuyingPrice: boolean = false): Observable<any> {
        const user = this.authService.getConnectedUser();
        if (!user?.id) return new Observable(observer => observer.error('No user'));

        return this.updateSettings(user.id, {
            defaults: { productVisibleToPublic, productToDisplay, showBuyingPrice }
        });
    }

    // Helper method to update navigation
    updateNavigation(defaultScreen: 'dashboard' | 'products' | 'orders' | 'stats'): Observable<any> {
        const user = this.authService.getConnectedUser();
        if (!user?.id) return new Observable(observer => observer.error('No user'));

        return this.updateSettings(user.id, {
            navigation: { defaultScreen }
        });
    }

    // Apply theme to document
    applyTheme(settings: UserSettings): void {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', settings.theme.primaryColor);

        // Calculate derived colors
        root.style.setProperty('--primary-dark', this.darkenColor(settings.theme.primaryColor, 20));
        root.style.setProperty('--primary-light', this.lightenColor(settings.theme.primaryColor, 40));

        // Apply dark/light mode
        document.body.classList.remove('dark-mode', 'light-mode');
        document.body.classList.add(`${settings.theme.mode}-mode`);
    }

    private darkenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    private lightenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}
