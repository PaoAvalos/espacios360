// ─── Supabase Config ───────────────────────────────────────────────
// 1. Create a free project at https://supabase.com
// 2. Go to Settings > API and copy your URL and anon key
// 3. Paste them below and set DEMO_MODE = false
const SUPABASE_URL = 'https://uytzcjllsrtmiuiaytra.supabase.co';
const SUPABASE_ANON_KEY = 
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dHpjamxsc3J0bWl1aWF5dHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTAwNjcsImV4cCI6MjA5NTE2NjA2N30.RDdQ7qmNCOSGhEiIjHweq-4gyxeq7I9R3uGEb1zfKZA';

// Set to false when Supabase is configured
const DEMO_MODE = false;

// WhatsApp number (with country code, no spaces or +)
const WHATSAPP_NUMBER = '528188055494';

// ─── Supabase client (only init when not in demo mode) ─────────────
let supabase = null;
if (!DEMO_MODE) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ─── SQL to run once in Supabase SQL Editor ────────────────────────
/*
CREATE TABLE properties (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(15,2),
  status       TEXT DEFAULT 'disponible' CHECK (status IN ('disponible','en_proceso','vendida')),
  type         TEXT CHECK (type IN ('casa','departamento','terreno','local_comercial','oficina')),
  operation    TEXT DEFAULT 'venta' CHECK (operation IN ('venta','renta')),
  address      TEXT,
  neighborhood TEXT,
  area_m2      NUMERIC(10,2),
  bedrooms     INT,
  bathrooms    NUMERIC(3,1),
  parking      INT,
  lat          NUMERIC(10,8),
  lng          NUMERIC(11,8),
  images       TEXT[],
  featured     BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Anyone can read
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON properties FOR SELECT USING (true);
CREATE POLICY "Admin write" ON properties FOR ALL USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
*/

// ─── Mock data (used when DEMO_MODE = true) ────────────────────────
const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Casa en San Pedro Garza García',
    description: 'Hermosa residencia en privada con vigilancia 24/7. Cocina integral, jardín amplio, área de servicio. Acabados de lujo en zona premium de Monterrey.',
    price: 4500000,
    status: 'disponible',
    type: 'casa',
    operation: 'venta',
    address: 'Calle Roble 123, Colonia del Valle',
    neighborhood: 'Del Valle',
    area_m2: 280,
    bedrooms: 4,
    bathrooms: 3.5,
    parking: 2,
    lat: 25.6519,
    lng: -100.4031,
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'],
    featured: true
  },
  {
    id: '2',
    title: 'Departamento Moderno en Cumbres',
    description: 'Departamento de lujo con vista panorámica. Amenidades: alberca, gimnasio, roof garden, concierge. Ideal para ejecutivos.',
    price: 2200000,
    status: 'disponible',
    type: 'departamento',
    operation: 'venta',
    address: 'Av. Las Cumbres 456, Torre Alux',
    neighborhood: 'Cumbres Elite',
    area_m2: 120,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    lat: 25.7513,
    lng: -100.3811,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
    featured: true
  },
  {
    id: '3',
    title: 'Terreno en Monterrey Sur',
    description: 'Excelente terreno plano en zona de alto crecimiento. Servicios completos. Ideal para desarrollo residencial o comercial.',
    price: 1800000,
    status: 'en_proceso',
    type: 'terreno',
    operation: 'venta',
    address: 'Calle Principal s/n, Col. La Joya',
    neighborhood: 'La Joya',
    area_m2: 500,
    bedrooms: null,
    bathrooms: null,
    parking: null,
    lat: 25.6350,
    lng: -100.2890,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
    featured: false
  },
  {
    id: '4',
    title: 'Local Comercial en Av. Garza Sada',
    description: 'Local en esquina con excelente flujo peatonal. Ideal para restaurante, tienda o consultorio. Estacionamiento propio.',
    price: 28000,
    status: 'disponible',
    type: 'local_comercial',
    operation: 'renta',
    address: 'Av. Garza Sada 789, Col. Tecnológico',
    neighborhood: 'Tecnológico',
    area_m2: 95,
    bedrooms: null,
    bathrooms: 1,
    parking: 3,
    lat: 25.6540,
    lng: -100.2890,
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'],
    featured: true
  },
  {
    id: '5',
    title: 'Casa en Cumbres Elite',
    description: 'Residencia de alto standing con alberca privada, jardín y cuarto de servicio. Zona exclusiva, vigilancia 24 horas.',
    price: 5800000,
    status: 'vendida',
    type: 'casa',
    operation: 'venta',
    address: 'Privada Los Pinos 12, Cumbres Elite',
    neighborhood: 'Cumbres Elite',
    area_m2: 380,
    bedrooms: 5,
    bathrooms: 4,
    parking: 3,
    lat: 25.7620,
    lng: -100.3950,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
    featured: false
  },
  {
    id: '6',
    title: 'Departamento en Valle Oriente',
    description: 'Depa en edificio nuevo con gym y alberca. Acabados finos, cocina equipada. Excelente ubicación en zona corporativa.',
    price: 1900000,
    status: 'disponible',
    type: 'departamento',
    operation: 'venta',
    address: 'Blvd. Antonio L. Rodríguez 1500, Valle Oriente',
    neighborhood: 'Valle Oriente',
    area_m2: 95,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    lat: 25.6657,
    lng: -100.3565,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
    featured: true
  },
  {
    id: '7',
    title: 'Oficina en Santa María',
    description: 'Oficina lista para usar en edificio corporativo de primer nivel. Incluye sala de juntas, recepción y estacionamiento.',
    price: 18000,
    status: 'disponible',
    type: 'oficina',
    operation: 'renta',
    address: 'Av. Santa María 230, Piso 8',
    neighborhood: 'Santa María',
    area_m2: 85,
    bedrooms: null,
    bathrooms: 2,
    parking: 4,
    lat: 25.6900,
    lng: -100.3400,
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    featured: false
  },
  {
    id: '8',
    title: 'Casa en San Nicolás de los Garza',
    description: 'Casa familiar en privada tranquila. Remodelada con cocina integral, baños nuevos. Jardín y área de juegos.',
    price: 2800000,
    status: 'disponible',
    type: 'casa',
    operation: 'venta',
    address: 'Calle Nogal 45, Col. Nogalar',
    neighborhood: 'Nogalar',
    area_m2: 185,
    bedrooms: 3,
    bathrooms: 2.5,
    parking: 2,
    lat: 25.7458,
    lng: -100.2930,
    images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'],
    featured: true
  }
];
