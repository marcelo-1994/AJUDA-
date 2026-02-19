-- Migration: Add Subscription Fields to Profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.plan_type IS 'Tipo do plano: free, pro, premium';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status da assinatura: active, inactive, past_due, canceled';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'ID do cliente no Stripe para assinaturas';
