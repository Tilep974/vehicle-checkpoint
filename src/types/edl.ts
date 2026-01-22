// Types pour l'application État des Lieux

export type RentalStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type EdlType = 'departure' | 'return';
export type DamageSeverity = 'minor' | 'moderate' | 'severe';

export interface Agency {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  color: string | null;
  year: number | null;
  agency_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  client_id: string;
  vehicle_id: string;
  agency_id: string;
  departure_date: string;
  return_date: string;
  status: RentalStatus;
  external_reference: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  vehicle?: Vehicle;
  agency?: Agency;
  edl?: Edl[];
}

export interface Edl {
  id: string;
  rental_id: string;
  type: EdlType;
  mileage: number | null;
  fuel_level: number | null;
  cleanliness_level: number | null;
  comments: string | null;
  client_signature_url: string | null;
  agent_signature_url: string | null;
  pdf_url: string | null;
  agent_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  damages?: Damage[];
  photos?: EdlPhoto[];
}

export interface Damage {
  id: string;
  edl_id: string;
  location: string;
  description: string;
  severity: DamageSeverity;
  is_new: boolean;
  created_at: string;
}

export interface EdlPhoto {
  id: string;
  edl_id: string;
  photo_url: string;
  category: string;
  description: string | null;
  created_at: string;
}

export interface RentalWithDetails extends Rental {
  client: Client;
  vehicle: Vehicle;
  agency: Agency;
  departure_edl?: Edl | null;
  return_edl?: Edl | null;
}
