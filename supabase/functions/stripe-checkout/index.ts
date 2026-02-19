import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { amount, userId, currency = "brl", successUrl, cancelUrl, type, plan } = await req.json();

        if (!userId) {
            throw new Error("Missing userId");
        }

        let sessionConfig: Stripe.Checkout.SessionCreateParams;

        if (type === 'subscription') {
            // Configuração para Assinatura (Pro ou Premium)
            let priceAmount = 0;
            let planName = '';

            if (plan === 'pro') {
                priceAmount = 990; // R$ 9,90
                planName = 'Plano Pro';
            } else if (plan === 'premium') {
                priceAmount = 1990; // R$ 19,90
                planName = 'Plano Premium';
            } else {
                throw new Error("Invalid subscription plan");
            }

            sessionConfig = {
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: currency,
                            product_data: {
                                name: `AJUDAÍ - ${planName}`,
                                description: `Assinatura mensal ${planName}`,
                            },
                            unit_amount: priceAmount,
                            recurring: {
                                interval: 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: successUrl || `${req.headers.get("origin") || ''}/#/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${req.headers.get("origin") || ''}/#/cancel`,
                metadata: {
                    userId: userId,
                    planType: plan, // 'pro' ou 'premium'
                    type: 'subscription'
                },
            };
        } else {
            // Configuração para Recarga Avulsa (Créditos)
            if (!amount) {
                throw new Error("Missing amount");
            }

            const amountInCents = Math.round(amount * 100);

            sessionConfig = {
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: currency,
                            product_data: {
                                name: "Saldo AJUDAÍ",
                                description: `Recarga de crédito para micro-consultoria`,
                            },
                            unit_amount: amountInCents,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: successUrl || `${req.headers.get("origin") || ''}/#/success`,
                cancel_url: cancelUrl || `${req.headers.get("origin") || ''}/#/cancel`,
                metadata: {
                    userId: userId,
                    type: 'credits'
                },
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
