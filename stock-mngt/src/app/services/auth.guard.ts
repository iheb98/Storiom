import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
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
        if (route.routeConfig.path == 'stores/add')
          return true;
        this.router.navigate(['stores/add']);
        return false
      }
    }
    this.router.navigate(['login']);
    return false;
  }

}
