export interface IBooking {
  id: number;
  property: number;
  guest: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  created_at: string;
}
