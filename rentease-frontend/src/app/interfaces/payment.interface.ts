export interface IPaymentRequest {
  booking_id: number;
  card_number: string;
  expiry: string;
  cvv: string;
  cardholder: string;
}

export interface IPaymentResponse {
  id: number;
  booking_id: number;
  amount: string;
  status: 'success' | 'failed';
  card_last4: string;
}
