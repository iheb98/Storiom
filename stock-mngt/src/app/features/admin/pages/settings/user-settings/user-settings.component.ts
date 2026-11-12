import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSettingsService, UserSettings } from 'src/app/core/services/user-settings.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
    faCog, faPalette, faHome, faBox, faChartLine,
    faShoppingCart, faSave, faUndo, faEye, faEyeSlash,
    faSun, faMoon, faLock
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
    // Icons
    faCog = faCog;
    faPalette = faPalette;
    faHome = faHome;
    faBox = faBox;
    faChartLine = faChartLine;
    faShoppingCart = faShoppingCart;
    faSave = faSave;
    faUndo = faUndo;
    faEye = faEye;
    faEyeSlash = faEyeSlash;
    faSun = faSun;
    faMoon = faMoon;
    faLock = faLock;

    showLockPassword = false;

    settingsForm: FormGroup;
    isLoading = true;
    isSaving = false;
    originalSettings: UserSettings;

    // Predefined color options
    colorOptions = [
        { name: 'Bleu Indigo', value: '#3f51b5' },
        { name: 'Bleu', value: '#2196f3' },
        { name: 'Vert', value: '#4caf50' },
        { name: 'Orange', value: '#ff9800' },
        { name: 'Rouge', value: '#f44336' },
        { name: 'Violet', value: '#9c27b0' },
        { name: 'Cyan', value: '#00bcd4' },
        { name: 'Rose', value: '#e91e63' }
    ];

    // Screen options
    screenOptions = [
        { name: 'Aucun (pas de redirection)', value: 'none', icon: faCog },
        { name: 'Tableau de bord', value: 'dashboard', icon: faHome },
        { name: 'Produits', value: 'products', icon: faBox },
        { name: 'Commandes', value: 'orders', icon: faShoppingCart },
        { name: 'Statistiques', value: 'stats', icon: faChartLine }
    ];

    constructor(
        private fb: FormBuilder,
        private settingsService: UserSettingsService,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        this.settingsForm = this.fb.group({
            primaryColor: ['#3f51b5'],
            mode: ['light'],
            productVisibleToPublic: [true],
            productToDisplay: [true],
            showBuyingPrice: [false],
            lockPassword: [''],
            defaultScreen: ['dashboard']
        });
    }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.loadSettings();
    }

    loadSettings(): void {
        this.isLoading = true;
        const user = this.authService.getConnectedUser();

        if (user?.id) {
            this.settingsService.getSettings(user.id).subscribe({
                next: (res) => {
                    if (res.success && res.settings) {
                        this.originalSettings = res.settings;
                        this.patchForm(res.settings);
                    }
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                    this.toastService.showError('Erreur lors du chargement des paramètres');
                }
            });
        } else {
            this.isLoading = false;
        }
    }

    patchForm(settings: UserSettings): void {
        this.settingsForm.patchValue({
            primaryColor: settings.theme?.primaryColor || '#3f51b5',
            mode: settings.theme?.mode || 'light',
            productVisibleToPublic: settings.defaults?.productVisibleToPublic ?? true,
            productToDisplay: settings.defaults?.productToDisplay ?? true,
            showBuyingPrice: settings.defaults?.showBuyingPrice ?? false,
            lockPassword: settings.defaults?.lockPassword || '',
            defaultScreen: settings.navigation?.defaultScreen || 'dashboard'
        });
    }

    saveSettings(): void {
        this.isSaving = true;
        const user = this.authService.getConnectedUser();

        if (!user?.id) {
            this.isSaving = false;
            return;
        }

        const formValues = this.settingsForm.value;
        const settings: Partial<UserSettings> = {
            theme: {
                primaryColor: formValues.primaryColor,
                mode: formValues.mode
            },
            defaults: {
                productVisibleToPublic: formValues.productVisibleToPublic,
                productToDisplay: formValues.productToDisplay,
                showBuyingPrice: formValues.showBuyingPrice,
                lockPassword: formValues.lockPassword
            },
            navigation: {
                defaultScreen: formValues.defaultScreen
            }
        };

        this.settingsService.updateSettings(user.id, settings).subscribe({
            next: (res) => {
                this.isSaving = false;
                if (res.success) {
                    this.originalSettings = res.settings;
                    this.settingsService.applyTheme(res.settings);
                    this.toastService.showSuccess('Paramètres enregistrés avec succès');
                }
            },
            error: () => {
                this.isSaving = false;
                this.toastService.showError('Erreur lors de la sauvegarde');
            }
        });
    }

    resetSettings(): void {
        if (this.originalSettings) {
            this.patchForm(this.originalSettings);
        }
    }

    selectColor(color: string): void {
        this.settingsForm.patchValue({ primaryColor: color });
    }

    toggleMode(): void {
        const currentMode = this.settingsForm.get('mode').value;
        this.settingsForm.patchValue({
            mode: currentMode === 'light' ? 'dark' : 'light'
        });
    }

    selectScreen(screen: string): void {
        this.settingsForm.patchValue({ defaultScreen: screen });
    }
}
