import { Component, OnInit } from '@angular/core';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';

@Component({
  selector: 'app-parent-categories-stats',
  templateUrl: './parent-categories-stats.component.html',
  styleUrls: ['./parent-categories-stats.component.scss']
})
export class ParentCategoriesStatsComponent implements OnInit {

  // Icons
  faFolderOpen = faFolderOpen;

  user;
  products;
  stats = [];

  // Loading States
  isLoading = true;

  constructor(
    private statService: StatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser();
    this.getParentCateoriesStats();
  }

  getParentCateoriesStats() {
    this.isLoading = true;
    this.statService.getParentCateoriesStats(this.user?.store).subscribe(
      response => {
        this.stats = response.slice(0, 5);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
}
