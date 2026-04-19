import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { landlordGuard } from './guards/landlord.guard';
import { landlordRedirectGuard } from './guards/landlord-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home),
    canActivate: [landlordRedirectGuard]
  },
  {
    path: 'properties',
    loadComponent: () =>
      import('./pages/properties/properties').then(m => m.Properties),
    canActivate: [landlordRedirectGuard]
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./pages/property-detail/property-detail').then(m => m.PropertyDetail),
    canActivate: [landlordRedirectGuard]
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
    path: 'payment/:bookingId',
    loadComponent: () =>
      import('./pages/payment/payment').then(m => m.Payment),
    canActivate: [authGuard]
  },

  // Extranet — landlord section
  {
    path: 'extranet',
    loadComponent: () =>
      import('./pages/extranet/extranet-shell/extranet-shell').then(m => m.ExtranetShell),
    canActivate: [landlordGuard],
    children: [
      {
        path: '',
        redirectTo: 'properties',
        pathMatch: 'full'
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('./pages/extranet/my-properties/my-properties').then(m => m.MyProperties)
      },
      {
        path: 'properties/new',
        loadComponent: () =>
          import('./pages/extranet/property-form/property-form').then(m => m.PropertyForm)
      },
      {
        path: 'properties/:id/edit',
        loadComponent: () =>
          import('./pages/extranet/property-form/property-form').then(m => m.PropertyForm)
      },
      {
        path: 'properties/:id/calendar',
        loadComponent: () =>
          import('./pages/extranet/property-calendar/property-calendar').then(m => m.PropertyCalendar)
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./pages/extranet/my-bookings/my-bookings').then(m => m.MyBookings)
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];
