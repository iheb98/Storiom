import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  connectedUser;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.connectedUser = this.authService.getConnectedUser()
  }

}
