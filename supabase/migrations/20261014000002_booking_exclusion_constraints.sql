-- ====================================================================
-- AMEN WELLNESS CENTRE — BOOKING INTEGRITY & EXCLUSION CONSTRAINTS
-- Migration: 20261014000002_booking_exclusion_constraints.sql
-- Description: Prevents double-booking of therapists and rooms with buffer
-- using PostgreSQL btree_gist extension and exclusion constraints.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. THERAPIST EXCLUSION CONSTRAINT
-- A therapist cannot have overlapping bookings (starts_at to buffer_ends_at)
-- unless the booking is soft-deleted or cancelled.
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_therapist_bookings
EXCLUDE USING gist (
    therapist_id WITH =,
    tstzrange(starts_at, buffer_ends_at, '[)') WITH &&
)
WHERE (deleted_at IS NULL AND status IN ('pending', 'confirmed'));

-- 2. ROOM EXCLUSION CONSTRAINT
-- A room cannot have overlapping bookings (starts_at to buffer_ends_at)
-- unless the booking is soft-deleted or cancelled.
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_room_bookings
EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(starts_at, buffer_ends_at, '[)') WITH &&
)
WHERE (deleted_at IS NULL AND status IN ('pending', 'confirmed'));

-- 3. THERAPIST TIME-OFF EXCLUSION
-- A therapist cannot be scheduled for a booking during an approved time-off window.
CREATE OR REPLACE FUNCTION check_therapist_time_off()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM time_off
        WHERE therapist_id = NEW.therapist_id
          AND deleted_at IS NULL
          AND tstzrange(starts_at, ends_at, '[)') && tstzrange(NEW.starts_at, NEW.buffer_ends_at, '[)')
    ) THEN
        RAISE EXCEPTION 'Therapist % has approved time off during the requested slot (starts_at: %, buffer_ends_at: %)',
            NEW.therapist_id, NEW.starts_at, NEW.buffer_ends_at
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_therapist_time_off ON bookings;
CREATE TRIGGER trg_check_therapist_time_off
BEFORE INSERT OR UPDATE OF therapist_id, starts_at, buffer_ends_at, status, deleted_at
ON bookings
FOR EACH ROW
WHEN (NEW.deleted_at IS NULL AND NEW.status IN ('pending', 'confirmed'))
EXECUTE FUNCTION check_therapist_time_off();
