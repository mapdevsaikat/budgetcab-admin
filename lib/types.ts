export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'driver_enroute'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_user'
  | 'cancelled_by_driver'
  | 'cancelled_by_admin'
  | 'no_show'
  | 'expired';

export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string | null;
  user_first_name: string | null;
  user_mobile: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  pickup_digipin: string | null;
  pickup_address: string | null;
  drop_lat: number | null;
  drop_lng: number | null;
  drop_address: string | null;
  drop_digipin: string | null;
  distance_km: number | null;
  toll: number | null;
  price_total: number | null;
  status: BookingStatus;
  scheduled_time: string | null;
  driver_id: string | null;
  cancellation_reason: string | null;
  actual_pickup_time: string | null;
  actual_drop_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string | null;
  is_active: boolean;
  shift_start: string | null;
  shift_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingRule {
  id: number;
  base_fare: number | null;
  per_km_rate: number | null;
  time_slot_type: string;
  start_time: string | null;
  end_time: string | null;
  priority: number | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  role: 'admin' | 'user' | 'driver';
  onboarding_completed: boolean | null;
  created_at: string;
  updated_at: string;
}

