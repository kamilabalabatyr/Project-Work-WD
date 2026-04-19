export type BookingStatus = 'upcoming' | 'current' | 'completed' | 'cancelled';

export interface IBooking {
  id: number;
  property: number;
  property_title?: string;
  property_city?: string;
  guest: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: 'active' | 'cancelled';
  booking_status: BookingStatus;
  created_at: string;
}
