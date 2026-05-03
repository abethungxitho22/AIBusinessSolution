import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BusinessType =
  | 'food_vendor'
  | 'clothing_beauty'
  | 'furniture'
  | 'retail'
  | 'service_provider';

export interface Profile {
  id: string;
  username: string;
  email: string;
  cellphone: string;
  business_type: BusinessType;
  business_name: string;
  created_at: string;
}

export interface SalesEntry {
  id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_date: string;
  notes: string;
  created_at: string;
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  food_vendor: 'Food Vendor',
  clothing_beauty: 'Clothing & Beauty',
  furniture: 'Furniture Seller',
  retail: 'Retail Shop',
  service_provider: 'Service Provider',
};
