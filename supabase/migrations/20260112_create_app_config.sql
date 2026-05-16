-- Create app_config table for dynamic settings
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read config
CREATE POLICY "Everyone can read app_config" ON public.app_config
    FOR SELECT
    USING (true);

-- Policy: Only service_role can update (or authenticated admins if you have roles)
-- For now, we'll restricting write access to service_role mostly to be safe
CREATE POLICY "Service role can manage app_config" ON public.app_config
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert the APK download URL
INSERT INTO public.app_config (key, value, description)
VALUES (
    'android_apk_url',
    'https://github.com/Alexsoto042/kineticapp/releases/download/v1.0.0-beta/app-kinetic-beta.apk',
    'URL de descarga directa del APK para Android'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;
