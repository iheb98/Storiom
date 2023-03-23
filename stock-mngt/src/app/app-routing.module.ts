import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './general/home/home.component';
import { StoresMngtComponent } from './stores/stores-mngt/stores-mngt.component';

const routes: Routes = [
  { path: 'stores', component: StoresMngtComponent },
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
