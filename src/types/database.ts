export type Role = 'customer' | 'business' | 'admin'
export type BusinessCategory = 'restaurant' | 'cafe' | 'viandas' | 'bar' | 'panaderia' | 'pasteleria' | 'sushi' | 'comida_para_llevar' | 'pizzeria' | 'hamburgueseria' | 'other'
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
  | 'sports'
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
  categories: string[]          // ← nuevo
  subcategory: string | null
  address: string | null
  pueblo: string | null
  phone: string | null
  whatsapp: string | null       // ← nuevo
  instagram: string | null
  facebook: string | null
  logo_url: string | null
  cover_url: string | null
  menu_pdf_url: string | null
  menu_photos_urls: string[]
  video_url: string | null
  menu_link: string | null      // ← nuevo
  accepts_reservations: boolean // ← nuevo
  is_open: boolean
  is_premium?: boolean
  total_views?: number
  total_leads?: number
  offers_delivery: boolean
  offers_takeaway: boolean
  offers_dine_in: boolean
  status: BusinessStatus
  group_name: string | null
  group_id: string | null
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  business_id: string
  title: string
  description: string | null
  discount_percentage: number | null
  discount_label: string | null
  valid_until: string
  is_active: boolean
  created_at: string
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
  phone_2: string | null
  phones: ServicePhone[]
  address: string | null
  schedule: string | null
  category: string
  locality_id: string | null
  sort_order: number
  is_active: boolean
  specialties: string | null
  has_guardia: boolean
  is_on_duty: boolean
  created_at: string
  updated_at: string
}

export interface BusinessPhoto {
  id: string
  business_id: string
  url: string
  sort_order: number
  created_at: string
}

export interface Locality {
  id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface ServicePhone {
  label: string
  phone: string
  is_whatsapp: boolean
}

export interface UtilityService {
  id: string
  locality_id: string
  name: string
  category: string
  phone: string | null
  phone_2: string | null
  phones: ServicePhone[]
  address: string | null
  description: string | null
  hours: string | null
  specialties: string | null
  has_guardia: boolean
  is_on_duty: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface TransportSchedule {
  id: string
  company: string
  origin_id: string
  destination_id: string
  departure_time: string
  arrival_time: string | null
  days: string[]
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface TransportCompany {
  id: string
  name: string
  description: string | null
  phone: string | null
  website: string | null
  address: string | null
  coordinates: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Novedad {
  id: string
  title: string | null
  content: string | null
  image_url: string | null
  locality: string | null
  expires_at: string | null
  created_at: string
  published: boolean
}