import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const targetUrl = state.url;

    if (route.data.loginPage && this.auth.isLoggedIn()) {
      this.router.navigate(['/products']);
      return false;
    } else if (route.data.loginPage && !this.auth.isLoggedIn()) {
      return true;
    }

    if (this.auth.isLoggedIn()) {
      const user = this.auth.getConnectedUser();
      const requiredRoles = route.data.roles;

      // Role-based access control
      if (requiredRoles && !this.hasRole(user, requiredRoles)) {
        this.router.navigate(['/']);
        return false;
      }

      // If user has a store, allow access
      if (user?.store) return true;

      // Allow access to onboarding and add store pages
      if (targetUrl.includes('stores/onboarding') || targetUrl.includes('stores/add') || targetUrl.includes('create-store')) {
        return true;
      }

      // Redirect to onboarding for all other admin pages
      return this.router.parseUrl('/seller-onboarding');
    }

    this.router.navigate(['login']);
    return false;
  }

  private hasRole(user: any, roles: string[]): boolean {
    return roles.includes(user?.role);
  }
}
