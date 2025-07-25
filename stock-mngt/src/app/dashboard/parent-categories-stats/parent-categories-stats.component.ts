import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { StatService } from 'src/app/services/stat.service';

@Component({
  selector: 'app-parent-categories-stats',
  templateUrl: './parent-categories-stats.component.html',
  styleUrls: ['./parent-categories-stats.component.scss']
})
export class ParentCategoriesStatsComponent implements OnInit {

  user;
  products;
  stats = []
  constructor(
    private statService: StatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser()
    this.getParentCateoriesStats()
  }


  getParentCateoriesStats() {
    this.statService.getParentCateoriesStats(this.user?.store).subscribe(
      response => {
        this.stats = response.slice(0, 5)
      }
    )
  }
}
