// Requêtes Supabase pour l'application EDL

import { supabase } from "@/integrations/supabase/client";
import type { RentalWithDetails, Edl, Damage, EdlPhoto } from "@/types/edl";

export async function getTodayRentals(type: 'departure' | 'return'): Promise<RentalWithDetails[]> {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const dateColumn = type === 'departure' ? 'departure_date' : 'return_date';

  const { data, error } = await supabase
    .from('rentals')
    .select(`*, client:clients(*), vehicle:vehicles(*), agency:agencies(*), edl(*)`)
    .gte(dateColumn, startOfDay)
    .lte(dateColumn, endOfDay)
    .order(dateColumn, { ascending: true });

  if (error) throw error;

  return (data || []).map(rental => ({
    ...rental,
    departure_edl: rental.edl?.find((e: any) => e.type === 'departure') || null,
    return_edl: rental.edl?.find((e: any) => e.type === 'return') || null,
  })) as RentalWithDetails[];
}

export async function getRentalById(id: string): Promise<RentalWithDetails | null> {
  const { data, error } = await supabase
    .from('rentals')
    .select(`*, client:clients(*), vehicle:vehicles(*), agency:agencies(*), edl(*, damages(*), photos:edl_photos(*))`)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    departure_edl: data.edl?.find((e: any) => e.type === 'departure') || null,
    return_edl: data.edl?.find((e: any) => e.type === 'return') || null,
  } as RentalWithDetails;
}

export async function createEdl(edlData: {
  rental_id: string;
  type: 'departure' | 'return';
  mileage?: number | null;
  fuel_level?: number;
  cleanliness_level?: number;
  comments?: string | null;
  agent_name?: string | null;
}): Promise<Edl> {
  const { data, error } = await supabase.from('edl').insert(edlData).select().single();
  if (error) throw error;
  return data as Edl;
}

export async function updateEdl(id: string, updates: Partial<Edl>): Promise<Edl> {
  const { data, error } = await supabase.from('edl').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Edl;
}

export async function addDamage(damage: {
  edl_id: string;
  location: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  is_new: boolean;
}): Promise<Damage> {
  const { data, error } = await supabase.from('damages').insert(damage).select().single();
  if (error) throw error;
  return data as Damage;
}

export async function removeDamage(id: string): Promise<void> {
  const { error } = await supabase.from('damages').delete().eq('id', id);
  if (error) throw error;
}

export async function addEdlPhoto(photo: {
  edl_id: string;
  photo_url: string;
  category: string;
  description?: string;
}): Promise<EdlPhoto> {
  const { data, error } = await supabase.from('edl_photos').insert(photo).select().single();
  if (error) throw error;
  return data as EdlPhoto;
}

export async function searchEdlHistory(filters: {
  clientName?: string;
  vehicleRegistration?: string;
  agencyId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<RentalWithDetails[]> {
  let query = supabase
    .from('rentals')
    .select(`*, client:clients(*), vehicle:vehicles(*), agency:agencies(*), edl(*)`)
    .order('departure_date', { ascending: false });

  if (filters.agencyId) query = query.eq('agency_id', filters.agencyId);
  if (filters.dateFrom) query = query.gte('departure_date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('return_date', filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;

  let results = data || [];

  if (filters.clientName) {
    const term = filters.clientName.toLowerCase();
    results = results.filter(r => 
      r.client?.first_name?.toLowerCase().includes(term) ||
      r.client?.last_name?.toLowerCase().includes(term)
    );
  }

  if (filters.vehicleRegistration) {
    const term = filters.vehicleRegistration.toLowerCase();
    results = results.filter(r => r.vehicle?.registration?.toLowerCase().includes(term));
  }

  return results.map(rental => ({
    ...rental,
    departure_edl: rental.edl?.find((e: any) => e.type === 'departure') || null,
    return_edl: rental.edl?.find((e: any) => e.type === 'return') || null,
  })) as RentalWithDetails[];
}

export async function getAgencies() {
  const { data, error } = await supabase.from('agencies').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function completeEdl(id: string, clientSignatureUrl: string, agentSignatureUrl: string): Promise<Edl> {
  const { data, error } = await supabase
    .from('edl')
    .update({
      client_signature_url: clientSignatureUrl,
      agent_signature_url: agentSignatureUrl,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Edl;
}
