import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'properties',
    loadComponent: () =>
      import('./pages/properties/properties').then(m => m.Properties)
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./pages/property-detail/property-detail').then(m => m.PropertyDetail)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'my-bookings',
    loadComponent: () =>
      import('./pages/my-bookings/my-bookings').then(m => m.MyBookings),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];