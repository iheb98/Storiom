import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-store-view',
  templateUrl: './store-view.component.html',
  styleUrls: ['./store-view.component.scss']
})
export class StoreViewComponent implements OnInit {
  store;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.store = this.authService.getConnectedUser()?.store;
  }

}
