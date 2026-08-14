-- ==============================================================================
-- SignKYC Supabase Schema Setup Script
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Create the `customers` table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    aadhaar_no TEXT NOT NULL,
    address TEXT NOT NULL,
    dob TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 2. Create the `kyc_sessions` table for RBI concurrent audit persistence
CREATE TABLE IF NOT EXISTS public.kyc_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_aadhaar TEXT NOT NULL,
    official_name TEXT NOT NULL,
    status TEXT NOT NULL,
    report_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for anonymous & authenticated client access (for V-CIP app demo)
-- Customers table policies
DROP POLICY IF EXISTS "Allow public read access to customers" ON public.customers;
CREATE POLICY "Allow public read access to customers"
    ON public.customers FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access to customers" ON public.customers;
CREATE POLICY "Allow public insert access to customers"
    ON public.customers FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to customers" ON public.customers;
CREATE POLICY "Allow public update access to customers"
    ON public.customers FOR UPDATE
    TO anon, authenticated
    USING (true);

-- KYC Sessions table policies
DROP POLICY IF EXISTS "Allow public insert to kyc_sessions" ON public.kyc_sessions;
CREATE POLICY "Allow public insert to kyc_sessions"
    ON public.kyc_sessions FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select to kyc_sessions" ON public.kyc_sessions;
CREATE POLICY "Allow public select to kyc_sessions"
    ON public.kyc_sessions FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Seed default demo customer (Priya Sharma)
INSERT INTO public.customers (full_name, aadhaar_no, address, dob)
VALUES (
    'Priya Sharma',
    '4829 1049 8821',
    'Flat 402, Shanti Heights, Bandra West, Mumbai 400050',
    '1995-06-15'
)
ON CONFLICT DO NOTHING;
