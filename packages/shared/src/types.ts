export interface Workshop {
  id: string;
  name: string;
  description: string;
  instructor: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  capacity: number;
  enrolled: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  workshop_id: string;
  workshop_name: string;
  creative_interest: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_id: string | null;
  razorpay_order_id: string | null;
  pass_id: string;
  amount: number;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  workshopId: string;
  creativeInterest?: string;
}

export interface AdminStats {
  totalRegistrations: number;
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
  checkedInCount: number;
}

export interface RazorpayOrderResponse {
  order_id: string;
  key_id: string;
}

export interface PaymentVerificationPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  registration_id: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}
