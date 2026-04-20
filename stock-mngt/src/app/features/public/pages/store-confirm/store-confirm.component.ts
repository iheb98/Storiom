import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { faCheckCircle, faTimesCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-confirm',
  templateUrl: './store-confirm.component.html',
  styleUrls: ['./store-confirm.component.scss']
})
export class StoreConfirmComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faArrowRight = faArrowRight;

  isLoading = true;
  success = false;
  errorMessage = '';
  basePath = '';

  constructor(
    private storeAuth: StoreAuthService,
    private domainService: DomainService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storeId = this.route.parent?.snapshot.paramMap.get('storeId');
    this.basePath = storeId ? `/preview-store/${storeId}` : '/store-home';

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.isLoading = false;
      this.errorMessage = 'Token de confirmation manquant.';
      return;
    }

    this.storeAuth.confirmAccount(token).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.success = true;
          // Auto-redirect after 3 seconds
          setTimeout(() => this.router.navigate([this.basePath]), 3000);
        } else {
          this.errorMessage = res.message || 'Token invalide ou expiré.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Token invalide ou expiré.';
      }
    });
  }
}
