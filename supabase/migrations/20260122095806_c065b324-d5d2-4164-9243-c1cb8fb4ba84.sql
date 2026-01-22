-- =============================================
-- TABLES PRINCIPALES - APPLICATION EDL
-- =============================================

-- Enum pour le statut des locations
CREATE TYPE public.rental_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Enum pour le type d'EDL
CREATE TYPE public.edl_type AS ENUM ('departure', 'return');

-- Enum pour la gravité des dommages
CREATE TYPE public.damage_severity AS ENUM ('minor', 'moderate', 'severe');

-- Table des agences
CREATE TABLE public.agencies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des véhicules
CREATE TABLE public.vehicles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    registration TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT,
    year INTEGER,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des clients
CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des locations
CREATE TABLE public.rentals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status rental_status NOT NULL DEFAULT 'pending',
    external_reference TEXT, -- Pour future synchronisation
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des États des Lieux
CREATE TABLE public.edl (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
    type edl_type NOT NULL,
    mileage INTEGER,
    fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    cleanliness_level INTEGER CHECK (cleanliness_level >= 1 AND cleanliness_level <= 5),
    comments TEXT,
    client_signature_url TEXT,
    agent_signature_url TEXT,
    pdf_url TEXT,
    agent_name TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des dommages
CREATE TABLE public.damages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    edl_id UUID NOT NULL REFERENCES public.edl(id) ON DELETE CASCADE,
    location TEXT NOT NULL, -- Position sur le véhicule
    description TEXT NOT NULL,
    severity damage_severity NOT NULL DEFAULT 'minor',
    is_new BOOLEAN NOT NULL DEFAULT true, -- Nouveau dommage ou existant
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des photos
CREATE TABLE public.edl_photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    edl_id UUID NOT NULL REFERENCES public.edl(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    category TEXT NOT NULL, -- 'exterior', 'interior', 'damage', 'mileage', 'fuel'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INDEX POUR PERFORMANCES
-- =============================================
CREATE INDEX idx_rentals_departure_date ON public.rentals(departure_date);
CREATE INDEX idx_rentals_return_date ON public.rentals(return_date);
CREATE INDEX idx_rentals_status ON public.rentals(status);
CREATE INDEX idx_edl_rental_id ON public.edl(rental_id);
CREATE INDEX idx_edl_type ON public.edl(type);
CREATE INDEX idx_damages_edl_id ON public.damages(edl_id);
CREATE INDEX idx_photos_edl_id ON public.edl_photos(edl_id);
CREATE INDEX idx_vehicles_registration ON public.vehicles(registration);

-- =============================================
-- RLS POLICIES (données accessibles aux agents authentifiés)
-- =============================================
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edl_photos ENABLE ROW LEVEL SECURITY;

-- Policies pour accès authentifié
CREATE POLICY "Agents can view agencies" ON public.agencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can view vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can manage rentals" ON public.rentals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Agents can manage edl" ON public.edl FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Agents can manage damages" ON public.damages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Agents can manage photos" ON public.edl_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- TRIGGER POUR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_edl_updated_at BEFORE UPDATE ON public.edl FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();