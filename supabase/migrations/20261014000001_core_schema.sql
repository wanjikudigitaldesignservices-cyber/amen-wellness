-- ====================================================================
-- AMEN WELLNESS CENTRE — MULTI-REGION DATABASE SCHEMA
-- Migration: 20261014000001_core_schema.sql
-- Description: Core tables, foreign keys, indexes, and soft-deletes.
-- All content tables carry region_id (VARCHAR(50)).
-- Money is stored in integer minor units + currency code.
-- All timestamps are timestamptz (UTC).
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. REGIONS TABLE
CREATE TABLE IF NOT EXISTS regions (
    slug VARCHAR(50) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    default_locale VARCHAR(10) NOT NULL,
    locales TEXT[] NOT NULL DEFAULT '{}',
    currency VARCHAR(3) NOT NULL,
    tz VARCHAR(50) NOT NULL,
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('intasend', 'stripe')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 3. REGION SETTINGS
CREATE TABLE IF NOT EXISTS region_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE CASCADE,
    hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    holidays JSONB NOT NULL DEFAULT '[]'::jsonb,
    contact JSONB NOT NULL DEFAULT '{}'::jsonb,
    tax_name VARCHAR(50) NOT NULL,
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    tax_inclusive BOOLEAN NOT NULL DEFAULT true,
    gateway_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo_defaults JSONB NOT NULL DEFAULT '{}'::jsonb,
    cancellation_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    deposit_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    no_show_fee_minor INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_region_settings_region UNIQUE (region_id)
);

-- 4. LOCATIONS / PREMISES
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    directions TEXT,
    parking_transit TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_locations_region_slug UNIQUE (region_id, slug)
);

-- 5. ROOMS & RESOURCES
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    room_type VARCHAR(50) NOT NULL DEFAULT 'treatment', -- treatment, couples, hydro, studio, meditation
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_rooms_region_slug UNIQUE (region_id, slug)
);

-- 6. SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'rituals',
    duration_minutes INT NOT NULL,
    buffer_minutes INT NOT NULL DEFAULT 15,
    price_minor INT NOT NULL, -- Integer minor currency units (cents/cents)
    currency VARCHAR(3) NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_services_region_slug UNIQUE (region_id, slug)
);

-- 7. SERVICE TRANSLATIONS
CREATE TABLE IF NOT EXISTS service_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    benefits TEXT[] NOT NULL DEFAULT '{}',
    contraindications TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_service_translations UNIQUE (service_id, locale)
);

-- 8. THERAPISTS
CREATE TABLE IF NOT EXISTS therapists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_therapists_region_slug UNIQUE (region_id, slug)
);

-- 9. THERAPIST TRANSLATIONS
CREATE TABLE IF NOT EXISTS therapist_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    name VARCHAR(200) NOT NULL,
    title VARCHAR(200) NOT NULL,
    bio TEXT NOT NULL,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_therapist_translations UNIQUE (therapist_id, locale)
);

-- 10. THERAPIST SERVICES (Many-to-Many)
CREATE TABLE IF NOT EXISTS therapist_services (
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (therapist_id, service_id)
);

-- 11. THERAPIST SCHEDULES (Weekly recurring availability)
CREATE TABLE IF NOT EXISTS therapist_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_schedule_times CHECK (start_time < end_time)
);

-- 12. TIME OFF
CREATE TABLE IF NOT EXISTS time_off (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_time_off_range CHECK (starts_at < ends_at)
);

-- 13. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    user_id UUID, -- References auth.users(id) when signed in
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 14. INTAKE FORMS (Sensitive medical / wellness data encrypted at rest)
CREATE TABLE IF NOT EXISTS intake_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL,
    encrypted_health_data TEXT NOT NULL, -- PGP symmetric/asymmetric or AES-GCM ciphertext
    allergy_notes TEXT,
    emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 15. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    buffer_ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    total_minor INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    tax_minor INT NOT NULL DEFAULT 0,
    deposit_minor INT NOT NULL DEFAULT 0,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_booking_times CHECK (starts_at < ends_at AND ends_at <= buffer_ends_at)
);

-- 16. BOOKING ITEMS
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    price_minor INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 17. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('intasend', 'stripe')),
    gateway_tx_id VARCHAR(100),
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    amount_minor INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    receipt_url TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 18. MEMBERSHIP PLANS
CREATE TABLE IF NOT EXISTS membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price_minor INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'quarterly', 'annual')),
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_membership_plans_region_slug UNIQUE (region_id, slug)
);

-- 19. MEMBERSHIPS
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    renews_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 20. GIFT CARDS
CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    initial_minor INT NOT NULL,
    balance_minor INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255),
    message TEXT,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_gift_card_balance CHECK (balance_minor >= 0 AND balance_minor <= initial_minor)
);

-- 21. GIFT CARD REDEMPTIONS
CREATE TABLE IF NOT EXISTS gift_card_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount_minor INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 22. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    max_capacity INT NOT NULL DEFAULT 12,
    instructor_id UUID REFERENCES therapists(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_classes_region_slug UNIQUE (region_id, slug)
);

-- 23. CLASS SESSIONS
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    instructor_id UUID REFERENCES therapists(id) ON DELETE SET NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    price_minor INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    capacity INT NOT NULL DEFAULT 12,
    booked_count INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_session_capacity CHECK (booked_count <= capacity),
    CONSTRAINT chk_session_times CHECK (starts_at < ends_at)
);

-- 24. CLASS BOOKINGS
CREATE TABLE IF NOT EXISTS class_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'attended', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_class_customer_session UNIQUE (session_id, customer_id)
);

-- 25. EVENTS & RETREATS
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    price_minor INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    capacity INT NOT NULL DEFAULT 20,
    booked_count INT NOT NULL DEFAULT 0,
    image_url TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_events_region_slug UNIQUE (region_id, slug)
);

-- 26. BLOG CATEGORIES
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_blog_categories_region_slug UNIQUE (region_id, slug)
);

-- 27. BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    slug VARCHAR(150) NOT NULL,
    cover_image_url TEXT,
    reading_time_minutes INT NOT NULL DEFAULT 5,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_blog_posts_region_slug UNIQUE (region_id, slug)
);

-- 28. BLOG TRANSLATIONS
CREATE TABLE IF NOT EXISTS blog_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    seo_title VARCHAR(200),
    seo_description VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_blog_translations UNIQUE (blog_post_id, locale)
);

-- 29. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    author_name VARCHAR(100) NOT NULL,
    location_text VARCHAR(100) NOT NULL,
    quote TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 30. FAQS
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 31. FAQ TRANSLATIONS
CREATE TABLE IF NOT EXISTS faq_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faq_id UUID NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_faq_translations UNIQUE (faq_id, locale)
);

-- 32. CMS PAGES
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_pages_region_slug UNIQUE (region_id, slug)
);

-- 33. CMS PAGE BLOCKS
CREATE TABLE IF NOT EXISTS page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    block_type VARCHAR(50) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 34. MEDIA ASSETS (per-region photography manifest & records)
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL, -- hero, premises, services, team, gallery, blog, og
    file_path TEXT NOT NULL,
    width INT,
    height INT,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/webp',
    size_bytes BIGINT,
    alt_translations JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"en-KE": "...", "sw": "..."}
    focal_point VARCHAR(20) DEFAULT 'center',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 35. CONTACT MESSAGES (Inbox)
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 36. CORPORATE ENQUIRIES
CREATE TABLE IF NOT EXISTS corporate_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    participant_count INT NOT NULL DEFAULT 10,
    preferred_dates TEXT,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'booked', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 37. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    is_active BOOLEAN NOT NULL DEFAULT true,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_newsletter_region_email UNIQUE (region_id, email)
);

-- 38. JOB POSTS
CREATE TABLE IF NOT EXISTS job_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time',
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_job_posts_region_slug UNIQUE (region_id, slug)
);

-- 39. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_post_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(slug) ON DELETE RESTRICT,
    applicant_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewing', 'interviewed', 'rejected', 'hired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 40. ADMIN ROLES (RBAC: super_admin, region_admin, receptionist, therapist, content_editor)
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users(id)
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'region_admin', 'receptionist', 'therapist', 'content_editor')),
    region_id VARCHAR(50) REFERENCES regions(slug) ON DELETE CASCADE, -- NULL for super_admin
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_admin_user_role_region UNIQUE (user_id, role, region_id),
    CONSTRAINT chk_super_admin_region CHECK (
        (role = 'super_admin' AND region_id IS NULL) OR
        (role <> 'super_admin' AND region_id IS NOT NULL)
    )
);

-- 41. AUDIT LOG (Immutable audit trail for all admin writes)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    region_id VARCHAR(50) REFERENCES regions(slug) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    before_state JSONB,
    after_state JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 42. WEBHOOK EVENTS (Idempotent webhook tracking for IntaSend & Stripe)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('intasend', 'stripe')),
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- INDEXES ON FOREIGN KEYS & REGION_ID (Section 5 requirement)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_region_settings_region ON region_settings(region_id);
CREATE INDEX IF NOT EXISTS idx_locations_region ON locations(region_id);
CREATE INDEX IF NOT EXISTS idx_rooms_region ON rooms(region_id);
CREATE INDEX IF NOT EXISTS idx_services_region ON services(region_id);
CREATE INDEX IF NOT EXISTS idx_service_translations_service ON service_translations(service_id);
CREATE INDEX IF NOT EXISTS idx_therapists_region ON therapists(region_id);
CREATE INDEX IF NOT EXISTS idx_therapist_translations_therapist ON therapist_translations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_schedules_therapist ON therapist_schedules(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_schedules_region ON therapist_schedules(region_id);
CREATE INDEX IF NOT EXISTS idx_time_off_therapist ON time_off(therapist_id);
CREATE INDEX IF NOT EXISTS idx_time_off_region ON time_off(region_id);
CREATE INDEX IF NOT EXISTS idx_customers_region ON customers(region_id);
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_region ON intake_forms(region_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_customer ON intake_forms(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_region ON bookings(region_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON bookings(starts_at);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_region ON payments(region_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_membership_plans_region ON membership_plans(region_id);
CREATE INDEX IF NOT EXISTS idx_memberships_region ON memberships(region_id);
CREATE INDEX IF NOT EXISTS idx_memberships_customer ON memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_region ON gift_cards(region_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_card ON gift_card_redemptions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_classes_region ON classes(region_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_class ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_region ON class_sessions(region_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_session ON class_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_events_region ON events(region_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_region ON blog_categories(region_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_region ON blog_posts(region_id);
CREATE INDEX IF NOT EXISTS idx_blog_translations_post ON blog_translations(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_region ON testimonials(region_id);
CREATE INDEX IF NOT EXISTS idx_faqs_region ON faqs(region_id);
CREATE INDEX IF NOT EXISTS idx_faq_translations_faq ON faq_translations(faq_id);
CREATE INDEX IF NOT EXISTS idx_pages_region ON pages(region_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_region ON media_assets(region_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_region ON contact_messages(region_id);
CREATE INDEX IF NOT EXISTS idx_corporate_enquiries_region ON corporate_enquiries(region_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_region ON newsletter_subscribers(region_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_region ON job_posts(region_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_post ON job_applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_user ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_region ON admin_roles(region_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_region ON audit_log(region_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
