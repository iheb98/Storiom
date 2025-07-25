import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (route.data.loginPage && this.auth.isLoggedIn()) {
      this.router.navigate(['/products']); 
      return false;
    } else if (route.data.loginPage && !this.auth.isLoggedIn()) {
      return true;
    }

    if (this.auth.isLoggedIn()) {
      const user = this.auth.getConnectedUser();
      const requiredRoles = route.data.roles; // Get roles from route

      // Role-based access control
      if (requiredRoles && !this.hasRole(user, requiredRoles)) {
        this.router.navigate(['/']); // Redirect if no permission
        return false;
      }

      // Ensure store exists for the user
      if (user?.store) return true;

      if (route.routeConfig?.path === 'stores/add') return true;

      this.router.navigate(['stores/add']);
      return false;
    }

    this.router.navigate(['login']);
    return false;
  }

  private hasRole(user: any, roles: string[]): boolean {
    console.log(roles)
    console.log(user)
    return roles.includes(user?.role);
  }
}
