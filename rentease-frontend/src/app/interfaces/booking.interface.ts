export interface IBooking {
    id: number;
    property: number;
    guest: number;
    check_in: string;
    check_out: string;
    guests_count: number;
    total_price: number;
  }