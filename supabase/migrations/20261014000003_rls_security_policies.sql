-- ====================================================================
-- AMEN WELLNESS CENTRE — ZERO TRUST ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20261014000003_rls_security_policies.sql
-- Description: Deny-by-default on all tables. Region isolation via JWT claims.
-- Nairobi admin cannot read or write Paris data.
-- ====================================================================

-- 1. SECURITY HELPER FUNCTIONS
-- Extract role from Supabase JWT (app_metadata.role) or fallback to admin_roles table
CREATE OR REPLACE FUNCTION auth_role()
RETURNS VARCHAR AS $$
DECLARE
    jwt_role TEXT;
BEGIN
    jwt_role := COALESCE(
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
        current_setting('request.jwt.claim.role', true)
    );
    IF jwt_role IS NOT NULL THEN
        RETURN jwt_role;
    END IF;

    -- Fallback to database admin_roles for direct/testing queries
    RETURN (
        SELECT role FROM admin_roles
        WHERE user_id = auth.uid() AND deleted_at IS NULL
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if current user is super_admin (access to all regions)
CREATE OR REPLACE FUNCTION auth_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth_role() = 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if current user has access to a specific region_id
CREATE OR REPLACE FUNCTION auth_has_region(target_region VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    jwt_regions JSONB;
BEGIN
    -- Super admins have global access
    IF auth_is_super_admin() THEN
        RETURN true;
    END IF;

    -- Check JWT app_metadata.region_ids array
    jwt_regions := current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' -> 'region_ids';
    IF jwt_regions IS NOT NULL AND jsonb_typeof(jwt_regions) = 'array' THEN
        IF jwt_regions ? target_region THEN
            RETURN true;
        END IF;
    END IF;

    -- Check direct single region claim: app_metadata.region_id
    IF (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'region_id') = target_region THEN
        RETURN true;
    END IF;

    -- Fallback to admin_roles table lookup
    RETURN EXISTS (
        SELECT 1 FROM admin_roles
        WHERE user_id = auth.uid()
          AND deleted_at IS NULL
          AND (region_id = target_region OR role = 'super_admin')
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. ENABLE RLS ON EVERY SINGLE TABLE (Deny-by-default)
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- PUBLIC READ POLICIES (Catalog & Regional Content)
-- ====================================================================

-- Regions: anyone can read active regions
CREATE POLICY "Public can view active regions" ON regions
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Region Settings: public can read non-deleted settings
CREATE POLICY "Public can view region settings" ON region_settings
FOR SELECT USING (deleted_at IS NULL);

-- Locations: public can view active locations
CREATE POLICY "Public can view active locations" ON locations
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Rooms: public can view active rooms
CREATE POLICY "Public can view active rooms" ON rooms
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Services & Translations: public can view active services
CREATE POLICY "Public can view active services" ON services
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Public can view service translations" ON service_translations
FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
        SELECT 1 FROM services
        WHERE services.id = service_translations.service_id
          AND services.is_active = true
          AND services.deleted_at IS NULL
    )
);

-- Therapists & Translations
CREATE POLICY "Public can view active therapists" ON therapists
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Public can view therapist translations" ON therapist_translations
FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
        SELECT 1 FROM therapists
        WHERE therapists.id = therapist_translations.therapist_id
          AND therapists.is_active = true
          AND therapists.deleted_at IS NULL
    )
);

CREATE POLICY "Public can view therapist services" ON therapist_services
FOR SELECT USING (true);

CREATE POLICY "Public can view therapist schedules" ON therapist_schedules
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Public can view therapist time off for slot checking" ON time_off
FOR SELECT USING (deleted_at IS NULL);

-- Membership Plans
CREATE POLICY "Public can view active membership plans" ON membership_plans
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Classes & Sessions
CREATE POLICY "Public can view active classes" ON classes
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Public can view scheduled class sessions" ON class_sessions
FOR SELECT USING (status = 'scheduled' AND deleted_at IS NULL);

-- Events
CREATE POLICY "Public can view events" ON events
FOR SELECT USING (deleted_at IS NULL);

-- Blog
CREATE POLICY "Public can view blog categories" ON blog_categories
FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Public can view published blog posts" ON blog_posts
FOR SELECT USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "Public can view blog translations" ON blog_translations
FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
        SELECT 1 FROM blog_posts
        WHERE blog_posts.id = blog_translations.blog_post_id
          AND blog_posts.is_published = true
          AND blog_posts.deleted_at IS NULL
    )
);

-- Testimonials & FAQs
CREATE POLICY "Public can view testimonials" ON testimonials
FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Public can view active faqs" ON faqs
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Public can view faq translations" ON faq_translations
FOR SELECT USING (deleted_at IS NULL);

-- Pages & Blocks
CREATE POLICY "Public can view published pages" ON pages
FOR SELECT USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "Public can view page blocks" ON page_blocks
FOR SELECT USING (deleted_at IS NULL);

-- Media Assets
CREATE POLICY "Public can view active media assets" ON media_assets
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Job Posts
CREATE POLICY "Public can view active job posts" ON job_posts
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- ====================================================================
-- PUBLIC / CUSTOMER WRITE POLICIES
-- ====================================================================

-- Newsletter signup
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
FOR INSERT WITH CHECK (true);

-- Contact message submission
CREATE POLICY "Anyone can submit contact message" ON contact_messages
FOR INSERT WITH CHECK (true);

-- Corporate enquiry submission
CREATE POLICY "Anyone can submit corporate enquiry" ON corporate_enquiries
FOR INSERT WITH CHECK (true);

-- Job application submission
CREATE POLICY "Anyone can apply for jobs" ON job_applications
FOR INSERT WITH CHECK (true);

-- Customers: users can view and update their own customer record
CREATE POLICY "Customers view own profile" ON customers
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Customers insert profile" ON customers
FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Customers update own profile" ON customers
FOR UPDATE USING (user_id = auth.uid());

-- Bookings: customers can view their own bookings
CREATE POLICY "Customers view own bookings" ON bookings
FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);

CREATE POLICY "Customers insert booking" ON bookings
FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid() OR auth.uid() IS NULL)
);

CREATE POLICY "Customers view own booking items" ON booking_items
FOR SELECT USING (
    booking_id IN (
        SELECT id FROM bookings
        WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
);

-- Intake forms: restricted to customer owner or therapist
CREATE POLICY "Customer can view own intake form" ON intake_forms
FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);

CREATE POLICY "Customer can insert own intake form" ON intake_forms
FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);

-- Memberships: customers can view their own
CREATE POLICY "Customers view own memberships" ON memberships
FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);

-- Gift cards: public can check card validity by code (SELECT only)
CREATE POLICY "Public verify gift card" ON gift_cards
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- ====================================================================
-- REGION ISOLATED ADMIN POLICIES (Zero Trust RBAC)
-- A Nairobi admin CANNOT read or write Paris data.
-- ====================================================================

-- Region Settings
CREATE POLICY "Admin manage region settings" ON region_settings
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Locations & Rooms
CREATE POLICY "Admin manage locations" ON locations
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage rooms" ON rooms
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Services & Translations
CREATE POLICY "Admin manage services" ON services
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage service translations" ON service_translations
FOR ALL USING (
    EXISTS (SELECT 1 FROM services WHERE services.id = service_translations.service_id AND auth_has_region(services.region_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM services WHERE services.id = service_translations.service_id AND auth_has_region(services.region_id))
);

-- Therapists & Translations
CREATE POLICY "Admin manage therapists" ON therapists
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage therapist translations" ON therapist_translations
FOR ALL USING (
    EXISTS (SELECT 1 FROM therapists WHERE therapists.id = therapist_translations.therapist_id AND auth_has_region(therapists.region_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM therapists WHERE therapists.id = therapist_translations.therapist_id AND auth_has_region(therapists.region_id))
);

CREATE POLICY "Admin manage therapist schedules" ON therapist_schedules
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage time off" ON time_off
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Bookings & Items
CREATE POLICY "Admin manage bookings" ON bookings
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage booking items" ON booking_items
FOR ALL USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND auth_has_region(bookings.region_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND auth_has_region(bookings.region_id))
);

-- Customers
CREATE POLICY "Admin manage customers" ON customers
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Intake Forms: restricted to therapist assigned or region admin
CREATE POLICY "Admin manage intake forms" ON intake_forms
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Payments
CREATE POLICY "Admin manage payments" ON payments
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Memberships & Plans
CREATE POLICY "Admin manage membership plans" ON membership_plans
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage memberships" ON memberships
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Gift Cards
CREATE POLICY "Admin manage gift cards" ON gift_cards
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage gift card redemptions" ON gift_card_redemptions
FOR ALL USING (
    EXISTS (SELECT 1 FROM gift_cards WHERE gift_cards.id = gift_card_redemptions.gift_card_id AND auth_has_region(gift_cards.region_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM gift_cards WHERE gift_cards.id = gift_card_redemptions.gift_card_id AND auth_has_region(gift_cards.region_id))
);

-- Classes & Sessions
CREATE POLICY "Admin manage classes" ON classes
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage class sessions" ON class_sessions
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage class bookings" ON class_bookings
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Events
CREATE POLICY "Admin manage events" ON events
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Blog
CREATE POLICY "Admin manage blog categories" ON blog_categories
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage blog posts" ON blog_posts
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage blog translations" ON blog_translations
FOR ALL USING (
    EXISTS (SELECT 1 FROM blog_posts WHERE blog_posts.id = blog_translations.blog_post_id AND auth_has_region(blog_posts.region_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM blog_posts WHERE blog_posts.id = blog_translations.blog_post_id AND auth_has_region(blog_posts.region_id))
);

-- Testimonials & FAQs
CREATE POLICY "Admin manage testimonials" ON testimonials
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage faqs" ON faqs
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage faq translations" ON faq_translations
FOR ALL USING (
    EXISTS (SELECT 1 FROM faqs WHERE faqs.id = faq_translations.faq_id AND auth_has_region(faqs.region_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM faqs WHERE faqs.id = faq_translations.faq_id AND auth_has_region(faqs.region_id))
);

-- CMS Pages & Blocks
CREATE POLICY "Admin manage pages" ON pages
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage page blocks" ON page_blocks
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Media Assets
CREATE POLICY "Admin manage media assets" ON media_assets
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Inboxes
CREATE POLICY "Admin manage contact messages" ON contact_messages
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage corporate enquiries" ON corporate_enquiries
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage newsletter subscribers" ON newsletter_subscribers
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Careers
CREATE POLICY "Admin manage job posts" ON job_posts
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

CREATE POLICY "Admin manage job applications" ON job_applications
FOR ALL USING (auth_has_region(region_id)) WITH CHECK (auth_has_region(region_id));

-- Admin Roles: only super_admin can manage roles
CREATE POLICY "Super admin manage admin roles" ON admin_roles
FOR ALL USING (auth_is_super_admin()) WITH CHECK (auth_is_super_admin());

CREATE POLICY "Users read own admin role" ON admin_roles
FOR SELECT USING (user_id = auth.uid());

-- Audit Log: read-only for admins in their region
CREATE POLICY "Admin view audit log" ON audit_log
FOR SELECT USING (auth_is_super_admin() OR auth_has_region(region_id));

-- Webhook Events: server/service-role only
CREATE POLICY "Super admin manage webhooks" ON webhook_events
FOR ALL USING (auth_is_super_admin()) WITH CHECK (auth_is_super_admin());
