import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Listings } from './pages/listings/listings';
import { ListingDetail } from './pages/listing-detail/listing-detail';
import { MyListings } from './pages/my-listings/my-listings';
import { MyBookings } from './pages/my-bookings/my-bookings';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'listings', component: Listings },
  { path: 'listings/:id', component: ListingDetail },
  { path: 'my-listings', component: MyListings },
  { path: 'my-bookings', component: MyBookings },
  { path: '', redirectTo: '/listings', pathMatch: 'full' }
];