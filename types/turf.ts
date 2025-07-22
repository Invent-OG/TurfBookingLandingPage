import { UUID } from "crypto";

export interface Turf {
  id: UUID; // UUID
  name: string;
  description: string;
  location: string;
  type: string;

  price_per_hour: string;

  is_weekday_pricing_enabled: boolean;
  weekday_morning_start: string; // Time in 'HH:mm' format
  weekday_evening_start: string; // Time in 'HH:mm' format
  weekday_morning_price?: string; // Optional
  weekday_evening_price?: string; // Optional

  is_weekend_pricing_enabled: boolean;
  weekend_morning_start: string; // Time in 'HH:mm' format
  weekend_evening_start: string; // Time in 'HH:mm' format
  weekend_morning_price?: string; // Optional
  weekend_evening_price?: string; // Optional

  slot_interval: string;

  opening_time: string; // Time in 'HH:mm' format
  closing_time: string; // Time in 'HH:mm' format
  max_players: string;
  max_hours: string;
  min_hours: string;
  is_disabled: boolean;
  disabled_reason?: string; // Optional
  image_url?: string; // Optional
}
