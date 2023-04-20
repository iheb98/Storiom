import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  canActivate(route: ActivatedRouteSnapshot) {
    if (route.data.loginPage && this.auth.isLoggedIn()) {
      return false;
    } else if (route.data.loginPage && !this.auth.isLoggedIn())
      return true
    if (this.auth.isLoggedIn()) {
      if (this.auth.getConnectedUser()?.store)
      return true;
      else{
        this.router.navigate(['stores/add']);
        return false
      }

    }
    this.router.navigate(['login']);
    return false;
  }

}
