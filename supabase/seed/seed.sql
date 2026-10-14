-- ====================================================================
-- AMEN WELLNESS CENTRE — MULTI-REGION SEED DATA
-- File: supabase/seed/seed.sql
-- Description: Complete seed data for Nairobi, New York, and Paris.
-- Covers: 3 regions, settings, locations, rooms, 27 services (9 per region),
-- 18 therapists (6 per region), weekly schedules, membership plans, FAQs,
-- testimonials, blog categories, and demo posts.
-- All demo content is flagged `is_demo = true`.
-- ====================================================================

-- 1. REGIONS
INSERT INTO regions (slug, city, country, default_locale, locales, currency, tz, gateway, is_active)
VALUES
    ('nairobi',  'Nairobi',  'Kenya',  'en-KE', ARRAY['en-KE', 'sw'],     'KES', 'Africa/Nairobi',   'intasend', true),
    ('new-york', 'New York', 'USA',    'en-US', ARRAY['en-US'],           'USD', 'America/New_York', 'stripe',   true),
    ('paris',    'Paris',    'France', 'fr-FR', ARRAY['fr-FR', 'en'],     'EUR', 'Europe/Paris',     'stripe',   true)
ON CONFLICT (slug) DO NOTHING;

-- 2. REGION SETTINGS
INSERT INTO region_settings (
    id, region_id, hours, holidays, contact, tax_name, tax_rate, tax_inclusive,
    cancellation_policy, deposit_percentage, no_show_fee_minor
)
VALUES
(
    '90000000-0000-0000-0000-000000000001',
    'nairobi',
    '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "09:00", "close": "19:00"}}'::jsonb,
    '[{"date": "2026-12-12", "name": "Jamhuri Day"}, {"date": "2026-10-20", "name": "Mashujaa Day"}]'::jsonb,
    '{"phone": "+254 700 000 001", "email": "nairobi@amenwellness.com", "address": "Muringa Road, Karen, Nairobi, Kenya"}'::jsonb,
    'VAT', 0.1600, true,
    '{"free_cancellation_hours": 24, "fee_percentage": 50}'::jsonb,
    20.00, 200000
),
(
    '90000000-0000-0000-0000-000000000002',
    'new-york',
    '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'::jsonb,
    '[{"date": "2026-11-26", "name": "Thanksgiving Day"}, {"date": "2026-12-25", "name": "Christmas Day"}]'::jsonb,
    '{"phone": "+1 (212) 555-0199", "email": "newyork@amenwellness.com", "address": "452 Broome St, SoHo, New York, NY 10013"}'::jsonb,
    'Sales tax', 0.0887, false,
    '{"free_cancellation_hours": 12, "fee_percentage": 50}'::jsonb,
    50.00, 5000
),
(
    '90000000-0000-0000-0000-000000000003',
    'paris',
    '{"monday": {"open": "09:00", "close": "20:00"}, "tuesday": {"open": "09:00", "close": "20:00"}, "wednesday": {"open": "09:00", "close": "20:00"}, "thursday": {"open": "09:00", "close": "20:00"}, "friday": {"open": "09:00", "close": "20:00"}, "saturday": {"open": "09:00", "close": "20:00"}, "sunday": {"open": "10:00", "close": "18:00"}}'::jsonb,
    '[{"date": "2026-07-14", "name": "Fête Nationale"}, {"date": "2026-11-11", "name": "Armistice"}]'::jsonb,
    '{"phone": "+33 1 42 68 55 00", "email": "paris@amenwellness.com", "address": "18 Rue de Turenne, 75004 Paris, France"}'::jsonb,
    'TVA', 0.2000, true,
    '{"free_cancellation_hours": 24, "fee_percentage": 50}'::jsonb,
    30.00, 3500
)
ON CONFLICT (region_id) DO NOTHING;

-- 3. LOCATIONS (1 per region)
INSERT INTO locations (id, region_id, name, slug, address_line1, address_line2, city, postal_code, country, lat, lng, phone, email, directions, parking_transit)
VALUES
('a0000000-0000-0000-0000-000000000001', 'nairobi', 'Amen Nairobi Garden Sanctuary', 'karen-sanctuary', 'Muringa Road, off Dagoretti Road', 'Karen Estate', 'Nairobi', '00502', 'Kenya', -1.3197, 36.7065, '+254 700 000 001', 'nairobi@amenwellness.com', 'Located 5 minutes from The Hub Karen. Enter through Muringa Gate.', 'Complimentary secure private parking on premises.'),
('a0000000-0000-0000-0000-000000000002', 'new-york', 'Amen SoHo Loft Retreat', 'soho-loft', '452 Broome Street', 'Floor 3-5', 'New York', '10013', 'USA', 40.7219, -74.0011, '+1 (212) 555-0199', 'newyork@amenwellness.com', 'Corner of Broome and Mercer St. Dedicated elevator to Floor 3.', 'Subway: N, R, W at Prince St or 6 at Spring St.'),
('a0000000-0000-0000-0000-000000000003', 'paris', 'Amen Marais Hôtel Particulier', 'le-marais', '18 Rue de Turenne', 'Cour d''Honneur', 'Paris', '75004', 'France', 48.8559, 2.3638, '+33 1 42 68 55 00', 'paris@amenwellness.com', 'Au fond de la cour d''honneur pavée.', 'Métro: Saint-Paul (Ligne 1) ou Chemin Vert (Ligne 8). Parking public Saint-Antoine à 200m.')
ON CONFLICT (region_id, slug) DO NOTHING;

-- 4. ROOMS (4 per location = 12 total)
INSERT INTO rooms (id, region_id, location_id, name, slug, capacity, room_type)
VALUES
-- Nairobi
('b0000000-0000-0000-0000-000000000001', 'nairobi', 'a0000000-0000-0000-0000-000000000001', 'Acacia Garden Suite', 'acacia-suite', 1, 'treatment'),
('b0000000-0000-0000-0000-000000000002', 'nairobi', 'a0000000-0000-0000-0000-000000000001', 'Baobab Couples Sanctuary', 'baobab-couples', 2, 'couples'),
('b0000000-0000-0000-0000-000000000003', 'nairobi', 'a0000000-0000-0000-0000-000000000001', 'Highland Hydrotherapy Garden', 'highland-hydro', 4, 'hydro'),
('b0000000-0000-0000-0000-000000000004', 'nairobi', 'a0000000-0000-0000-0000-000000000001', 'Open-Air Cedar Yoga Deck', 'cedar-deck', 15, 'studio'),
-- New York
('b0000000-0000-0000-0000-000000000005', 'new-york', 'a0000000-0000-0000-0000-000000000002', 'Walnut Treatment Suite A', 'walnut-suite-a', 1, 'treatment'),
('b0000000-0000-0000-0000-000000000006', 'new-york', 'a0000000-0000-0000-0000-000000000002', 'SoHo Couples Loft', 'soho-couples', 2, 'couples'),
('b0000000-0000-0000-0000-000000000007', 'new-york', 'a0000000-0000-0000-0000-000000000002', 'Cryo & Infrared Recovery Pod', 'cryo-infrared-pod', 2, 'hydro'),
('b0000000-0000-0000-0000-000000000008', 'new-york', 'a0000000-0000-0000-0000-000000000002', 'Rooftop Meditation Terrace', 'rooftop-meditation', 12, 'meditation'),
-- Paris
('b0000000-0000-0000-0000-000000000009', 'paris', 'a0000000-0000-0000-0000-000000000003', 'Salon Tuileries', 'salon-tuileries', 1, 'treatment'),
('b0000000-0000-0000-0000-000000000010', 'paris', 'a0000000-0000-0000-0000-000000000003', 'Suite Marais Duo', 'suite-marais-duo', 2, 'couples'),
('b0000000-0000-0000-0000-000000000011', 'paris', 'a0000000-0000-0000-0000-000000000003', 'Hammam en Marbre & Bassin', 'hammam-marbre', 4, 'hydro'),
('b0000000-0000-0000-0000-000000000012', 'paris', 'a0000000-0000-0000-0000-000000000003', 'Studio Sérénité Parquet', 'studio-serenite', 10, 'studio')
ON CONFLICT (region_id, slug) DO NOTHING;

-- 5. SERVICES (9 per region = 27 services total)
-- Prices in integer minor units (e.g. KES 6500 = 650000 minor; USD 165 = 16500 minor; EUR 120 = 12000 minor)
INSERT INTO services (id, region_id, slug, category, duration_minutes, buffer_minutes, price_minor, currency, is_featured, is_demo)
VALUES
-- NAIROBI SERVICES (9)
('c0000000-0000-0000-0000-000000000001', 'nairobi', 'signature-massage', 'massage', 60, 15, 650000, 'KES', true, true),
('c0000000-0000-0000-0000-000000000002', 'nairobi', 'deep-tissue-recovery', 'massage', 75, 15, 780000, 'KES', false, true),
('c0000000-0000-0000-0000-000000000003', 'nairobi', 'facial-skin-rituals', 'skin', 60, 15, 600000, 'KES', false, true),
('c0000000-0000-0000-0000-000000000004', 'nairobi', 'mindfulness-breathwork', 'mind', 50, 10, 450000, 'KES', false, true),
('c0000000-0000-0000-0000-000000000005', 'nairobi', 'yoga-movement', 'movement', 60, 15, 300000, 'KES', false, true),
('c0000000-0000-0000-0000-000000000006', 'nairobi', 'nutrition-wellness-consult', 'consult', 60, 15, 550000, 'KES', false, true),
-- Nairobi Specials (3)
('c0000000-0000-0000-0000-000000000007', 'nairobi', 'highland-botanical-ritual', 'rituals', 90, 20, 950000, 'KES', true, true),
('c0000000-0000-0000-0000-000000000008', 'nairobi', 'garden-hydrotherapy-circuit', 'hydro', 60, 15, 500000, 'KES', false, true),
('c0000000-0000-0000-0000-000000000009', 'nairobi', 'weekend-retreat-day', 'retreat', 240, 30, 2200000, 'KES', true, true),

-- NEW YORK SERVICES (9)
('c0000000-0000-0000-0000-000000000010', 'new-york', 'signature-massage', 'massage', 60, 15, 16500, 'USD', true, true),
('c0000000-0000-0000-0000-000000000011', 'new-york', 'deep-tissue-recovery', 'massage', 75, 15, 19500, 'USD', false, true),
('c0000000-0000-0000-0000-000000000012', 'new-york', 'facial-skin-rituals', 'skin', 60, 15, 18500, 'USD', false, true),
('c0000000-0000-0000-0000-000000000013', 'new-york', 'mindfulness-breathwork', 'mind', 50, 10, 12000, 'USD', false, true),
('c0000000-0000-0000-0000-000000000014', 'new-york', 'yoga-movement', 'movement', 60, 15, 4500, 'USD', false, true),
('c0000000-0000-0000-0000-000000000015', 'new-york', 'nutrition-wellness-consult', 'consult', 60, 15, 17500, 'USD', false, true),
-- New York Specials (3)
('c0000000-0000-0000-0000-000000000016', 'new-york', 'cryo-infrared-recovery', 'recovery', 60, 15, 19000, 'USD', true, true),
('c0000000-0000-0000-0000-000000000017', 'new-york', 'float-suite', 'recovery', 60, 15, 13500, 'USD', false, true),
('c0000000-0000-0000-0000-000000000018', 'new-york', 'executive-reset', 'express', 45, 10, 11000, 'USD', true, true),

-- PARIS SERVICES (9)
('c0000000-0000-0000-0000-000000000019', 'paris', 'massage-signature', 'massage', 60, 15, 12000, 'EUR', true, true),
('c0000000-0000-0000-0000-000000000020', 'paris', 'massage-deep-tissue', 'massage', 75, 15, 14500, 'EUR', false, true),
('c0000000-0000-0000-0000-000000000021', 'paris', 'soin-visage-eclat', 'skin', 60, 15, 13000, 'EUR', false, true),
('c0000000-0000-0000-0000-000000000022', 'paris', 'pleine-conscience-respiration', 'mind', 50, 10, 9500, 'EUR', false, true),
('c0000000-0000-0000-0000-000000000023', 'paris', 'yoga-mouvement', 'movement', 60, 15, 3500, 'EUR', false, true),
('c0000000-0000-0000-0000-000000000024', 'paris', 'consultation-naturopathie', 'consult', 60, 15, 12500, 'EUR', false, true),
-- Paris Specials (3)
('c0000000-0000-0000-0000-000000000025', 'paris', 'hammam-gommage-rituel', 'rituals', 75, 15, 15000, 'EUR', true, true),
('c0000000-0000-0000-0000-000000000026', 'paris', 'soin-visage-signature', 'skin', 75, 15, 16500, 'EUR', false, true),
('c0000000-0000-0000-0000-000000000027', 'paris', 'couples-salon-de-the-rituel', 'rituals', 90, 20, 26000, 'EUR', true, true)
ON CONFLICT (region_id, slug) DO NOTHING;

-- 6. SERVICE TRANSLATIONS (English + Swahili for Nairobi; English for NY; French + English for Paris)
INSERT INTO service_translations (service_id, locale, name, description, benefits, contraindications)
VALUES
-- Nairobi - English
('c0000000-0000-0000-0000-000000000001', 'en-KE', 'Amen Signature Massage', 'A restorative full-body holistic massage blending warm botanical oils with rhythmic neuromuscular techniques.', ARRAY['Muscle tension relief', 'Lymphatic circulation', 'Deep mental calm'], ARRAY['First trimester pregnancy', 'Open wounds']),
('c0000000-0000-0000-0000-000000000007', 'en-KE', 'Highland Botanical Body Ritual', 'A ceremonial full-body exfoliation and hydration with indigenous moringa, baobab oil, and Kenyan highland herbal compresses.', ARRAY['Deep hydration', 'Cellular renewal', 'Aromatic grounding'], ARRAY['Nut allergies']),
-- Nairobi - Swahili
('c0000000-0000-0000-0000-000000000001', 'sw', 'Masaji ya Kipekee ya Amen', 'Masaji kamili ya mwili inayotuliza misuli kwa kutumia mafuta asilia ya mimea na mikondo ya upole.', ARRAY['Kuondoa maumivu ya misuli', 'Mzunguko bora wa damu', 'Amani ya moyo'], ARRAY['Ujauzito wa miezi mitatu ya kwanza']),
-- New York - English
('c0000000-0000-0000-0000-000000000010', 'en-US', 'Amen Signature Massage', 'Precision bespoke bodywork crafted for urban decompression. Combines myofascial release with tailored aromatherapy.', ARRAY['Postural restoration', 'Cortisol reduction', 'Enhanced recovery'], ARRAY['Acute inflammation']),
('c0000000-0000-0000-0000-000000000016', 'en-US', 'Cryo + Infrared Recovery Circuit', 'Alternating full-spectrum infrared thermal sauna with localized cryo-stimulation for elite metabolic reset.', ARRAY['Rapid inflammation drop', 'Cellular detoxification', 'Deep energy restoration'], ARRAY['Severe cardiovascular condition', 'Pacemaker']),
('c0000000-0000-0000-0000-000000000018', 'en-US', 'Executive Reset', 'A high-yield 45-minute lunch-hour decompression focusing on cervical spine, shoulders, and cognitive calm.', ARRAY['Immediate desk fatigue relief', 'Mental clarity'], ARRAY['None']),
-- Paris - French (Default)
('c0000000-0000-0000-0000-000000000019', 'fr-FR', 'Massage Signature Amen', 'Une expérience sensorielle holistique mariant effleurages profonds, huiles botaniques précieuses et respiration rythmée.', ARRAY['Détente musculaire profonde', 'Harmonie corps et esprit', 'Éveil des sens'], ARRAY['Premier trimestre de grossesse']),
('c0000000-0000-0000-0000-000000000025', 'fr-FR', 'Rituel Hammam & Gommage au Savon Noir', 'Cérémonie purifiante au savon noir à l''eucalyptus, gommage traditionnel au gant Kassa et brumisation d''eau florale.', ARRAY['Purification épidermique', 'Détoxification cutanée', 'Douceur soyeuse'], ARRAY['Hypotension sévère', 'Plaies ouvertes']),
('c0000000-0000-0000-0000-000000000027', 'fr-FR', 'Rituel Duo Salon de Thé', 'Immersion complice à deux en suite privée suivie d''une dégustation de thés rares et mignardises bien-être.', ARRAY['Connexion et sérénité partagée', 'Détente sensorielle complète'], ARRAY['Aucune']),
-- Paris - English toggle
('c0000000-0000-0000-0000-000000000019', 'en', 'Amen Signature Massage', 'A sensory holistic ritual blending deep restorative massage, precious botanicals, and meditative breathwork.', ARRAY['Deep muscular relief', 'Body-mind harmony', 'Sensory renewal'], ARRAY['First trimester pregnancy'])
ON CONFLICT (service_id, locale) DO NOTHING;

-- 7. THERAPISTS (6 per region = 18 total)
INSERT INTO therapists (id, region_id, slug, email, phone, avatar_url, is_featured, is_demo)
VALUES
-- Nairobi Therapists (6)
('d0000000-0000-0000-0000-000000000001', 'nairobi', 'wambui-kamau', 'wambui.k@amenwellness.com', '+254 711 001 001', '/assets/nairobi/team/nairobi-team-wambui-01.webp', true, true),
('d0000000-0000-0000-0000-000000000002', 'nairobi', 'david-ochieng', 'david.o@amenwellness.com', '+254 711 001 002', '/assets/nairobi/team/nairobi-team-david-02.webp', true, true),
('d0000000-0000-0000-0000-000000000003', 'nairobi', 'faith-mutua', 'faith.m@amenwellness.com', '+254 711 001 003', '/assets/nairobi/team/nairobi-team-faith-03.webp', false, true),
('d0000000-0000-0000-0000-000000000004', 'nairobi', 'samuel-kiptoo', 'samuel.k@amenwellness.com', '+254 711 001 004', '/assets/nairobi/team/nairobi-team-samuel-04.webp', false, true),
('d0000000-0000-0000-0000-000000000005', 'nairobi', 'amina-hassan', 'amina.h@amenwellness.com', '+254 711 001 005', '/assets/nairobi/team/nairobi-team-amina-05.webp', false, true),
('d0000000-0000-0000-0000-000000000006', 'nairobi', 'kevin-mwangi', 'kevin.m@amenwellness.com', '+254 711 001 006', '/assets/nairobi/team/nairobi-team-kevin-06.webp', false, true),

-- New York Therapists (6)
('d0000000-0000-0000-0000-000000000007', 'new-york', 'elena-vance', 'elena.v@amenwellness.com', '+1 (212) 555-0201', '/assets/new-york/team/new-york-team-elena-01.webp', true, true),
('d0000000-0000-0000-0000-000000000008', 'new-york', 'marcus-chen', 'marcus.c@amenwellness.com', '+1 (212) 555-0202', '/assets/new-york/team/new-york-team-marcus-02.webp', true, true),
('d0000000-0000-0000-0000-000000000009', 'new-york', 'maya-patel', 'maya.p@amenwellness.com', '+1 (212) 555-0203', '/assets/new-york/team/new-york-team-maya-03.webp', false, true),
('d0000000-0000-0000-0000-000000000010', 'new-york', 'lucas-hayes', 'lucas.h@amenwellness.com', '+1 (212) 555-0204', '/assets/new-york/team/new-york-team-lucas-04.webp', false, true),
('d0000000-0000-0000-0000-000000000011', 'new-york', 'olivia-taylor', 'olivia.t@amenwellness.com', '+1 (212) 555-0205', '/assets/new-york/team/new-york-team-olivia-05.webp', false, true),
('d0000000-0000-0000-0000-000000000012', 'new-york', 'jordan-blake', 'jordan.b@amenwellness.com', '+1 (212) 555-0206', '/assets/new-york/team/new-york-team-jordan-06.webp', false, true),

-- Paris Therapists (6)
('d0000000-0000-0000-0000-000000000013', 'paris', 'camille-laurent', 'camille.l@amenwellness.com', '+33 1 42 68 55 11', '/assets/paris/team/paris-team-camille-01.webp', true, true),
('d0000000-0000-0000-0000-000000000014', 'paris', 'antoine-dubois', 'antoine.d@amenwellness.com', '+33 1 42 68 55 12', '/assets/paris/team/paris-team-antoine-02.webp', true, true),
('d0000000-0000-0000-0000-000000000015', 'paris', 'ines-benali', 'ines.b@amenwellness.com', '+33 1 42 68 55 13', '/assets/paris/team/paris-team-ines-03.webp', false, true),
('d0000000-0000-0000-0000-000000000016', 'paris', 'julien-mercier', 'julien.m@amenwellness.com', '+33 1 42 68 55 14', '/assets/paris/team/paris-team-julien-04.webp', false, true),
('d0000000-0000-0000-0000-000000000017', 'paris', 'sophie-renaud', 'sophie.r@amenwellness.com', '+33 1 42 68 55 15', '/assets/paris/team/paris-team-sophie-05.webp', false, true),
('d0000000-0000-0000-0000-000000000018', 'paris', 'claire-fontaine', 'claire.f@amenwellness.com', '+33 1 42 68 55 16', '/assets/paris/team/paris-team-claire-06.webp', false, true)
ON CONFLICT (region_id, slug) DO NOTHING;

-- 8. THERAPIST TRANSLATIONS
INSERT INTO therapist_translations (therapist_id, locale, name, title, bio, specialties)
VALUES
-- Nairobi
('d0000000-0000-0000-0000-000000000001', 'en-KE', 'Wambui Kamau', 'Lead Holistic Practitioner', 'Wambui has over 12 years of mastery in neuromuscular therapy, botanical formulation, and East African indigenous bodywork.', ARRAY['Neuromuscular Therapy', 'Botanical Body Rituals', 'Postural Alignment']),
('d0000000-0000-0000-0000-000000000001', 'sw', 'Wambui Kamau', 'Mtaalamu Mkuu wa Tiba Asilia', 'Wambui ana uzoefu wa zaidi ya miaka 12 katika uponyaji wa misuli na kutengeneza tiba za asili za mimea ya Kenya.', ARRAY['Uponyaji wa Misuli', 'Tiba ya Mimea Asilia']),
('d0000000-0000-0000-0000-000000000002', 'en-KE', 'David Ochieng', 'Senior Recovery & Sports Therapist', 'Former athletic recovery consultant specializing in deep tissue restoration, myofascial release, and kinetic mobility.', ARRAY['Deep Tissue', 'Sports Rehabilitation', 'Hydrotherapy']),
-- New York
('d0000000-0000-0000-0000-000000000007', 'en-US', 'Elena Vance, LMT', 'Director of Bodywork & Recovery', 'Licensed massage therapist with extensive background in orthopedic bodywork, craniosacral therapy, and metabolic recovery.', ARRAY['Orthopedic Massage', 'Cryo-Therapy', 'Craniosacral']),
('d0000000-0000-0000-0000-000000000008', 'en-US', 'Marcus Chen', 'Performance & Mobility Specialist', 'Specializes in desk-worker decompression, neuromuscular re-education, and restorative breath mechanics.', ARRAY['Myofascial Release', 'Breathwork', 'Executive Reset']),
-- Paris
('d0000000-0000-0000-0000-000000000013', 'fr-FR', 'Camille Laurent', 'Ostéopathe & Praticienne Bien-Être', 'Diplômée en ostéopathie et formée aux rituels de soin traditionnels, Camille privilégie une approche globale du lâcher-prise.', ARRAY['Ostéopathie douce', 'Massage Signature', 'Rituel Hammam']),
('d0000000-0000-0000-0000-000000000013', 'en', 'Camille Laurent', 'Osteopath & Lead Bodywork Practitioner', 'Trained in cranial osteopathy and ancestral bathing rituals, Camille offers an integrative approach to deep restorative rest.', ARRAY['Gentle Osteopathy', 'Signature Bodywork', 'Hammam Rituals']),
('d0000000-0000-0000-0000-000000000014', 'fr-FR', 'Antoine Dubois', 'Praticien Deep Tissue & Récupération', 'Expert en relâchement myofascial et récupération posturale pour les citadins actifs.', ARRAY['Deep Tissue', 'Drainage lymphatique', 'Récupération active'])
ON CONFLICT (therapist_id, locale) DO NOTHING;

-- 9. THERAPIST SCHEDULES (Sample schedules Mon-Fri 09:00 - 18:00)
INSERT INTO therapist_schedules (therapist_id, region_id, day_of_week, start_time, end_time)
SELECT id, region_id, 1, '09:00'::time, '18:00'::time FROM therapists;
INSERT INTO therapist_schedules (therapist_id, region_id, day_of_week, start_time, end_time)
SELECT id, region_id, 2, '09:00'::time, '18:00'::time FROM therapists;
INSERT INTO therapist_schedules (therapist_id, region_id, day_of_week, start_time, end_time)
SELECT id, region_id, 3, '09:00'::time, '18:00'::time FROM therapists;
INSERT INTO therapist_schedules (therapist_id, region_id, day_of_week, start_time, end_time)
SELECT id, region_id, 4, '09:00'::time, '18:00'::time FROM therapists;
INSERT INTO therapist_schedules (therapist_id, region_id, day_of_week, start_time, end_time)
SELECT id, region_id, 5, '09:00'::time, '18:00'::time FROM therapists;

-- 10. MEMBERSHIP PLANS (3 per region = 9 total)
INSERT INTO membership_plans (id, region_id, slug, name, description, price_minor, currency, billing_interval, benefits, is_demo)
VALUES
('e0000000-0000-0000-0000-000000000001', 'nairobi', 'garden-sanctuary-pass', 'Garden Sanctuary Club', 'Monthly signature ritual, unlimited open-air yoga deck access, and priority booking.', 1250000, 'KES', 'monthly', '["1 x 60-min ritual per month", "Unlimited yoga classes", "15% off additional treatments", "Guest day-pass included"]'::jsonb, true),
('e0000000-0000-0000-0000-000000000002', 'nairobi', 'wellness-immersion', 'Highland Immersion Tier', 'Two 75-min bespoke treatments monthly with hydrotherapy circuit access.', 2200000, 'KES', 'monthly', '["2 x 75-min treatments per month", "Unlimited hydrotherapy circuit", "20% off retreats"]'::jsonb, true),
('e0000000-0000-0000-0000-000000000003', 'new-york', 'soho-recovery-collective', 'SoHo Recovery Collective', 'Curated monthly bodywork, full cryo + infrared pod access, and rooftop meditation.', 32000, 'USD', 'monthly', '["1 x 75-min bodywork monthly", "Unlimited cryo + infrared sessions", "Rooftop meditation terrace access", "Priority express slots"]'::jsonb, true),
('e0000000-0000-0000-0000-000000000004', 'new-york', 'executive-decompression-pass', 'Executive Decompression Pass', 'Weekly 45-min lunch-hour resets designed for rapid urban revitalization.', 48000, 'USD', 'monthly', '["4 x Executive Reset sessions per month", "Express changing suite access", "Complimentary adaptogenic tea"]'::jsonb, true),
('e0000000-0000-0000-0000-000000000005', 'paris', 'cercle-du-marais', 'Le Cercle du Marais', 'Un rituel de 60 minutes par mois au choix, accès privatif au hammam et thé d''exception.', 19500, 'EUR', 'monthly', '["1 soin de 60 minutes par mois", "Accès hammam et bassin", "15% sur la boutique bien-être", "Réservation prioritaire"]'::jsonb, true),
('e0000000-0000-0000-0000-000000000006', 'paris', 'art-de-vivre-integral', 'Art de Vivre Intégral', 'Deux soins holistiques mensuels, accès illimité au studio de yoga et conciergerie.', 35000, 'EUR', 'monthly', '["2 soins holistiques par mois", "Accès illimité aux cours de yoga", "Dégustation salon de thé offerte", "Invitation aux soirées privées"]'::jsonb, true)
ON CONFLICT (region_id, slug) DO NOTHING;

-- 11. FAQS (5 per region with translations)
INSERT INTO faqs (id, region_id, category, display_order)
VALUES
('f0000000-0000-0000-0000-000000000001', 'nairobi', 'booking', 1),
('f0000000-0000-0000-0000-000000000002', 'nairobi', 'treatments', 2),
('f0000000-0000-0000-0000-000000000003', 'new-york', 'booking', 1),
('f0000000-0000-0000-0000-000000000004', 'new-york', 'recovery', 2),
('f0000000-0000-0000-0000-000000000005', 'paris', 'general', 1),
('f0000000-0000-0000-0000-000000000006', 'paris', 'hammam', 2);

INSERT INTO faq_translations (faq_id, locale, question, answer)
VALUES
('f0000000-0000-0000-0000-000000000001', 'en-KE', 'How far in advance should I book my appointment in Nairobi?', 'We recommend booking at least 48 to 72 hours in advance, especially for weekend sessions and botanical rituals.'),
('f0000000-0000-0000-0000-000000000001', 'sw', 'Ni siku ngapi kabla ninapaswa kujiandikisha Nairobi?', 'Tunapendekeza kuweka nafasi angalau saa 48 hadi 72 mapema, hasa kwa vipindi vya wikendi.'),
('f0000000-0000-0000-0000-000000000003', 'en-US', 'What is the cancellation policy in New York?', 'You may cancel or reschedule free of charge up to 12 hours prior to your scheduled appointment. Cancellations within 12 hours incur a 50% fee.'),
('f0000000-0000-0000-0000-000000000005', 'fr-FR', 'Faut-il apporter son propre linge pour le hammam ?', 'Tout est fourni sur place avec le plus grand soin : peignoirs moelleux en lin biologique, serviettes, chaussons et gants Kassa traditionnels.'),
('f0000000-0000-0000-0000-000000000005', 'en', 'Do I need to bring my own towels for the hammam in Paris?', 'Everything is provided for your comfort: organic linen bathrobes, towels, slippers, and traditional Kassa exfoliating mitts.')
ON CONFLICT (faq_id, locale) DO NOTHING;

-- 12. TESTIMONIALS (Realistic client testimonials per region)
INSERT INTO testimonials (region_id, author_name, location_text, quote, rating, is_featured, is_demo)
VALUES
('nairobi', 'Amina W.', 'Karen, Nairobi', 'The Highland Botanical ritual was transformative. Walking out onto the garden deck after the treatment felt like stepping into pure peace.', 5, true, true),
('nairobi', 'Marcus T.', 'Muthaiga, Nairobi', 'The hydrotherapy pool nestled among indigenous acacia trees is Nairobi''s finest kept wellness secret. Exemplary professionalism.', 5, true, true),
('new-york', 'Sarah L.', 'Tribeca, New York', 'In the middle of Manhattan chaos, stepping into Amen SoHo feels like arriving at a sanctuary in the clouds. The Cryo + Infrared circuit is essential to my routine.', 5, true, true),
('new-york', 'David R.', 'West Village, New York', 'The Executive Reset actually works. 45 minutes of targeted release and I returned to my afternoon meetings completely clear-headed.', 5, true, true),
('paris', 'Éléonore de V.', 'Le Marais, Paris', 'Un écrin de calme absolu en plein Marais. Le hammam en marbre et le massage signature sont tout simplement parfaits.', 5, true, true),
('paris', 'Jean-Baptiste M.', 'Saint-Germain, Paris', 'L''attention aux détails, la discrétion de l''équipe et la qualité du salon de thé font d''Amen une adresse incomparable à Paris.', 5, true, true);

-- 13. BLOG CATEGORIES
INSERT INTO blog_categories (id, region_id, slug, name)
VALUES
('11000000-0000-0000-0000-000000000001', 'nairobi', 'rituals', 'Botanical Rituals'),
('11000000-0000-0000-0000-000000000002', 'nairobi', 'mindfulness', 'African Mindfulness'),
('11000000-0000-0000-0000-000000000003', 'new-york', 'science', 'Recovery Science'),
('11000000-0000-0000-0000-000000000004', 'new-york', 'urban-calm', 'Urban Calm'),
('11000000-0000-0000-0000-000000000005', 'paris', 'art-de-vivre', 'Art de Vivre'),
('11000000-0000-0000-0000-000000000006', 'paris', 'soins-holistiques', 'Soins Holistiques')
ON CONFLICT (region_id, slug) DO NOTHING;

-- 14. BLOG POSTS (2 demo posts per region = 6 total)
INSERT INTO blog_posts (id, region_id, category_id, slug, cover_image_url, reading_time_minutes, is_published, is_demo, published_at)
VALUES
('22000000-0000-0000-0000-000000000001', 'nairobi', '11000000-0000-0000-0000-000000000001', 'healing-power-of-moringa-and-baobab', '/assets/nairobi/blog/nairobi-blog-botanicals-01.webp', 6, true, true, now() - interval '14 days'),
('22000000-0000-0000-0000-000000000002', 'nairobi', '11000000-0000-0000-0000-000000000002', 'garden-sanctuary-breathing-practices', '/assets/nairobi/blog/nairobi-blog-breathwork-02.webp', 5, true, true, now() - interval '7 days'),
('22000000-0000-0000-0000-000000000003', 'new-york', '11000000-0000-0000-0000-000000000003', 'circadian-reset-infrared-and-cryo', '/assets/new-york/blog/new-york-blog-cryo-01.webp', 7, true, true, now() - interval '10 days'),
('22000000-0000-0000-0000-000000000004', 'new-york', '11000000-0000-0000-0000-000000000004', 'soho-quiet-luxury-recovery-guide', '/assets/new-york/blog/new-york-blog-soho-02.webp', 5, true, true, now() - interval '3 days'),
('22000000-0000-0000-0000-000000000005', 'paris', '11000000-0000-0000-0000-000000000005', 'le-rituel-du-hammam-au-fil-des-siecles', '/assets/paris/blog/paris-blog-hammam-01.webp', 8, true, true, now() - interval '12 days'),
('22000000-0000-0000-0000-000000000006', 'paris', '11000000-0000-0000-0000-000000000006', 'la-philosophie-amen-ralentir-au-marais', '/assets/paris/blog/paris-blog-philosophie-02.webp', 6, true, true, now() - interval '4 days')
ON CONFLICT (region_id, slug) DO NOTHING;

INSERT INTO blog_translations (blog_post_id, locale, title, excerpt, content_markdown, seo_title, seo_description)
VALUES
('22000000-0000-0000-0000-000000000001', 'en-KE', 'The Healing Power of Highland Moringa and Baobab', 'How indigenous Kenyan flora forms the bedrock of our cellular restorative therapies.', 'Indigenous East African botanicals carry high concentrations of polyphenols and essential fatty acids. In our Karen sanctuary, moringa and baobab are cold-pressed within hours of harvest...', 'Healing Power of Moringa & Baobab | Amen Nairobi', 'Discover how indigenous Kenyan botanicals restore skin vitality at Amen Wellness Centre Nairobi.'),
('22000000-0000-0000-0000-000000000003', 'en-US', 'Circadian Optimization: The Science of Infrared and Cryo Cycling', 'Why contrasting thermal extremes stimulates cellular autophagy and restores deep sleep architecture.', 'In a city that never pauses, biological down-regulation is the ultimate luxury. Contrast thermal cycling alternates infrared vasodilation with cryogenic vasoconstriction...', 'Infrared & Cryo Recovery Science | Amen New York', 'Understand the metabolic recovery benefits of thermal cycling at Amen SoHo New York.'),
('22000000-0000-0000-0000-000000000005', 'fr-FR', 'Le Rituel du Hammam : Une Cérémonie Ancestrale Réinventée', 'Comment la vapeur chaude et le savon noir purifient le corps et libèrent les tensions de la vie parisienne.', 'Au cœur de notre hôtel particulier du Marais, le hammam en marbre perpétue un art millénaire du bain purificateur...', 'Le Rituel du Hammam à Paris | Amen Marais', 'Plongez dans l''art ancestral du bain thermal et de la purification cutanée chez Amen Wellness Paris.')
ON CONFLICT (blog_post_id, locale) DO NOTHING;
