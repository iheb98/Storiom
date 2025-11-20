import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// General components
import { LoginComponent } from './general/login/login.component';
import { RegisterComponent } from './general/register/register.component';
import { LandingPageComponent } from './general/landing-page/landing-page.component';
import { ConfirmAccountComponent } from './general/confirm-account/confirm-account.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TermsComponent } from './pages/terms/terms.component';
import { AuthGuard } from './core/services/auth.guard';

const routes: Routes = [
  // ------------ Public Interface ------------
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.module').then(m => m.PublicModule)
  },


  // ------------ Admin Interface ------------
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard] // Protect admin routes
  },

  // ------------ General Pages ------------
  { path: 'login', component: LoginComponent, data: { loginPage: true } },
  { path: 'register', component: RegisterComponent, data: { loginPage: true } },
  { path: 'confirm', component: ConfirmAccountComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'terms', component: TermsComponent },

  // Wildcard route
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
