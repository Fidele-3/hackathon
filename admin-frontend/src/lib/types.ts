export type UserLevel =
  | "citizen"
  | "buyer"
  | "cell_officer"
  | "sector_officer"
  | "district_officer"
  | "national_admin";

export type OfficerLevel = "national" | "district" | "sector" | "cell";
export type Specialization = "agronomist" | "veterinary";

export interface OfficerProfile {
  level: OfficerLevel;
  specialization: Specialization | null;
  managed_district: number | null;
  managed_sector: number | null;
  managed_cell: number | null;
  work_email: string | null;
}

export interface BuyerProfile {
  business_name: string;
  assigned_cells: number[];
  payment_method: "mobile_money" | "bank" | "cash";
  is_verified: boolean;
}

export interface Me {
  public_id: string;
  phone_number: string;
  email: string | null;
  national_id: string;
  full_name: string;
  dob: string | null;
  gender: "male" | "female" | null;
  village: number | null;
  user_level: UserLevel;
  officer_profile: OfficerProfile | null;
  buyer_profile: BuyerProfile | null;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface OfficerRoster {
  public_id: string;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  level: OfficerLevel;
  specialization: Specialization | null;
  managed_district: number | null;
  managed_sector: number | null;
  managed_cell: number | null;
  work_email: string | null;
}

export interface BuyerListItem {
  id: number;
  business_name: string;
  phone_number: string;
  full_name: string;
  assigned_cells: number[];
  payment_method: "mobile_money" | "bank" | "cash";
  is_verified: boolean;
  created_at: string;
}

export interface Land {
  id: number;
  cell: number;
  upi: string;
  hectares: string | null;
  planted_crop: number | null;
  season: "A" | "B" | "C" | null;
  season_year: number | null;
  registered_at: string;
}

export interface HarvestReport {
  id: number;
  land: number;
  crop: number;
  season: "A" | "B" | "C";
  season_year: number;
  quantity_kg: string;
  source: string;
  created_at: string;
}

export interface LivestockLocation {
  id: number;
  cell: number;
  livestock_type: number;
  count: number;
  registered_at: string;
}

export interface LivestockProduction {
  id: number;
  livestock_location: number;
  product_type: string;
  season: "A" | "B" | "C";
  season_year: number;
  quantity: string;
  unit: string;
  source: string;
  created_at: string;
}

export type ResourceRequestStatus = "pending" | "approved" | "rejected" | "delivered";
export type ResourceType = "fertilizer" | "seed" | "medicine" | "feed";

export interface ResourceRequest {
  id: number;
  land: number | null;
  livestock_location: number | null;
  resource_type: ResourceType;
  fertilizer: number | null;
  quantity_requested: string;
  unit: string;
  status: ResourceRequestStatus;
  assigned_officer: number | null;
  decision_comment: string;
  requested_at: string;
  decided_at: string | null;
  delivered_at: string | null;
}

export type StorageRequestStatus = "requested" | "approved" | "stored" | "rejected";

export interface StorageRequest {
  id: number;
  harvest_report: number;
  warehouse: number;
  quantity_kg: string;
  status: StorageRequestStatus;
  decided_by: number | null;
  decision_comment: string;
  requested_at: string;
  decided_at: string | null;
  stored_at: string | null;
}

export type IssueStatus = "open" | "assigned" | "resolved" | "rejected";
export type IssueCategory = "crop" | "livestock";

export interface FarmerIssue {
  id: number;
  category: IssueCategory;
  land: number | null;
  livestock_location: number | null;
  description: string;
  status: IssueStatus;
  reporter: Me;
  assigned_officer: Me | null;
  officer_response: string;
  resolved_at: string | null;
  created_at: string;
}

export interface MessageAttachment {
  id: number;
  file: string;
  thumbnail: string | null;
  file_type: string;
  hls_master: string | null;
  hls_720: string | null;
  processing_status: "not_needed" | "pending" | "processing" | "ready" | "failed";
}

export interface Message {
  id: number;
  conversation: number;
  sender: Me | null;
  is_ai_message: boolean;
  body: string;
  attachments: MessageAttachment[];
  created_at: string;
}

export interface Conversation {
  public_id: string;
  channel: "ai" | "officer";
  officer: Me | null;
  related_issue: number | null;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: number;
  scope: "national" | "district";
  district: number | null;
  summary_date: string;
  content: string;
  model_used: string;
  generated_at: string;
}

export interface ForecastResult {
  district: string;
  crop: string;
  season: "A" | "B" | "C";
  season_year: number;
  forecast: string;
}
