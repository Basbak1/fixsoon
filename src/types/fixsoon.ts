export type UserRole = 'customer' | 'provider' | 'admin';

export type ProviderType =
  | 'independent_professional'
  | 'registered_business'
  | 'mobile_technician'
  | 'repair_shop'
  | 'fleet_service_provider';

export type ProviderStatus =
  | 'draft'
  | 'submitted'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type RequestType = 'marketplace' | 'direct';

export type JobStatus =
  | 'assigned'
  | 'on_the_way'
  | 'arrived'
  | 'work_in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type RequestStatus =
  | 'open'
  | 'quoted'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'declined_by_provider';

export interface DynamicFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  seo_title: string;
  seo_description: string;
  dynamic_fields: DynamicFieldDefinition[];
}

export interface ServiceSubcategory {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  typical_duration: string;
  seo_title: string;
  seo_description: string;
}

export interface ProviderVerifications {
  email_verified: boolean;
  phone_verified: boolean;
  business_verified: boolean;
  license_verified: boolean;
  insurance_verified: boolean;
  profile_reviewed: boolean;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  business_name: string;
  provider_type: ProviderType;
  bio: string;
  avatar_url: string;
  primary_city: string;
  coverage_cities: string[];
  coverage_radius_km: number;
  category_ids: string[];
  subcategory_ids: string[];
  languages: string[];
  years_experience: number;
  starting_price: number | null;
  diagnostic_fee: number | null;
  free_estimates: boolean;
  pricing_notes: string;
  operating_hours: string;
  emergency_available: boolean;
  is_available_now: boolean;
  status: ProviderStatus;
  verifications: ProviderVerifications;
  rating_avg: number;
  review_count: number;
  completed_jobs_count: number;
  is_demo: boolean;
  created_at: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city?: string;
  saved_provider_ids?: string[];
}

export interface ServiceRequest {
  id: string;
  reference_code: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  request_type: RequestType;
  target_provider_id: string | null;
  target_provider_name?: string | null;
  category_id: string;
  category_name?: string;
  subcategory_id: string;
  subcategory_name?: string;
  problem_summary: string;
  problem_details: string;
  dynamic_fields: Record<string, string | boolean>;
  city: string;
  neighbourhood: string;
  postal_code: string;
  exact_address?: string;
  urgency: 'emergency' | 'today' | 'scheduled';
  status: RequestStatus;
  created_at: string;
}

export interface RequestMatch {
  id: string;
  request_id: string;
  provider_id: string;
  match_score: number;
  status: 'pending' | 'quoted' | 'declined' | 'expired';
  decline_reason?: string;
}

export interface EstimatePartItem {
  label: string;
  cost: number;
}

export interface Quote {
  id: string;
  request_id: string;
  provider_id: string;
  provider_name?: string;
  provider_slug?: string;
  provider_avatar?: string;
  provider_rating?: number;
  provider_review_count?: number;
  provider_verified?: boolean;
  estimate_template?: 'service_fee_plus_parts' | 'flat_rate';
  service_fee?: number | null;
  parts_line_items?: EstimatePartItem[];
  estimated_price: number;
  labour_cost: number | null;
  parts_cost: number | null;
  parts_included: boolean;
  eta_text: string;
  estimated_duration: string;
  warranty_terms: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
}

export interface JobStatusEntry {
  status: JobStatus;
  note: string;
  timestamp: string;
  actor_role: UserRole;
}

export interface Job {
  id: string;
  request_id: string;
  reference_code: string;
  quote_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  exact_address?: string;
  city: string;
  neighbourhood: string;
  provider_id: string;
  provider_name: string;
  provider_slug: string;
  service_name: string;
  problem_summary: string;
  estimated_price: number;
  status: JobStatus;
  status_history: JobStatusEntry[];
  review_submitted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  sender_role: UserRole;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  customer_id: string;
  customer_name: string;
  provider_id: string;
  rating: number;
  comment: string;
  service_name?: string;
  verified_job?: boolean;
  created_at: string;
}

export interface Dispute {
  id: string;
  job_id: string;
  request_id: string;
  reference_code: string;
  reporter_id: string;
  reporter_name: string;
  reason: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved';
  resolution_notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface GtaLocation {
  slug: string;
  name: string;
  region: string;
  neighbourhoods: string[];
}

export interface PlatformFeatureFlags {
  livePayments: boolean;
  realGpsTracking: boolean;
  aiDesignGeneration: boolean;
  paidPlanningPacks: boolean;
  liveProviderRegistration: boolean;
}

export interface PlatformConfigResponse {
  platformName: string;
  tagline: string;
  subBrandAutoEmergency: string;
  apiVersion: string;
  planningPackPriceCad: number;
  regions: string[];
  featureFlags: PlatformFeatureFlags;
}
