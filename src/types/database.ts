export type Role = 'customer' | 'business' | 'admin'
export type BusinessCategory = 'restaurant' | 'cafe' | 'viandas' | 'bar' | 'other'
export type BusinessStatus = 'pending' | 'active' | 'suspended'
export type BusinessType = 'gastronomy' | 'directory'
export type BusinessSection =
  | 'gastronomy'
  | 'health'
  | 'services'
  | 'tourism'
  | 'commerce'
  | 'events'
  | 'info'
  | 'education'
export type OrderType = 'takeaway' | 'delivery'
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'no_show'
export type SubscriptionStatus = 'trial' | 'active' | 'overdue' | 'cancelled'
export type BillingCycle = 'monthly' | 'yearly'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface Business {
  id: string
  owner_id: string | null
  name: string
  slug: string
  description: string | null
  section: BusinessSection
  type: BusinessType
  category: BusinessCategory | null
  subcategory: string | null
  address: string | null
  phone: string | null
  instagram: string | null
  logo_url: string | null
  cover_url: string | null
  is_open: boolean
  offers_delivery: boolean
  offers_takeaway: boolean
  offers_dine_in: boolean
  status: BusinessStatus
  created_at: string
  updated_at: string
}

export interface BusinessHours {
  id: string
  business_id: string
  day_of_week: number
  opens_at: string
  closes_at: string
  is_closed: boolean
}

export interface MenuCategory {
  id: string
  business_id: string
  name: string
  sort_order: number
  is_active: boolean
}

export interface MenuItem {
  id: string
  business_id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
  created_at: string
}

export interface DailyMenu {
  id: string
  business_id: string
  date: string
  is_published: boolean
  created_at: string
}

export interface DailyMenuItem {
  id: string
  daily_menu_id: string
  name: string
  description: string | null
  price: number
  includes_drink: boolean
}

export interface Order {
  id: string
  business_id: string
  customer_id: string
  type: OrderType
  status: OrderStatus
  scheduled_time: string | null
  estimated_time: number | null
  notes: string | null
  total: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_name: string
  item_price: number
  quantity: number
}

export interface Reservation {
  id: string
  business_id: string
  customer_id: string
  date: string
  time: string
  party_size: number
  status: ReservationStatus
  notes: string | null
  created_at: string
}

export interface Subscription {
  id: string
  business_id: string
  status: SubscriptionStatus
  price: number
  billing_cycle: BillingCycle
  current_period_start: string
  current_period_end: string
  notes: string | null
}

export interface UsefulContact {
  id: string
  title: string
  description: string | null
  phone: string | null
  address: string | null
  schedule: string | null
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}