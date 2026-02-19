import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req: Request) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new Response("No signature", { status: 400 });
    }

    try {
        const body = await req.text();
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret ?? "",
            undefined,
            cryptoProvider
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const type = session.metadata?.type;

            if (userId) {
                // Initialize Supabase admin client
                const supabaseAdmin = createClient(
                    Deno.env.get("SUPABASE_URL") ?? "",
                    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
                    {
                        auth: {
                            autoRefreshToken: false,
                            persistSession: false,
                        }
                    }
                );

                if (type === 'subscription') {
                    const planType = session.metadata?.planType;
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;

                    // Atualizar perfil com dados da assinatura
                    const { error: updateError } = await supabaseAdmin
                        .from("profiles")
                        .update({
                            plan_type: planType,
                            subscription_status: 'active',
                            stripe_customer_id: customerId,
                            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Aprox. 1 mês
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", userId);

                    if (updateError) console.error('Error updating subscription:', updateError);
                    else console.log(`Success: User ${userId} subscribed to ${planType}`);

                } else {
                    // Lógica para Créditos (Recarga)
                    const amountTotal = (session.amount_total || 0) / 100;

                    // Fetch current profile to get current balance
                    const { data: profile, error: fetchError } = await supabaseAdmin
                        .from("profiles")
                        .select("balance")
                        .eq("id", userId)
                        .single();

                    if (fetchError) {
                        console.error('Error fetching profile:', fetchError);
                        throw fetchError;
                    }

                    if (profile) {
                        const currentBalance = Number(profile.balance) || 0;
                        const newBalance = currentBalance + amountTotal;

                        const { error: updateError } = await supabaseAdmin
                            .from("profiles")
                            .update({
                                balance: newBalance,
                                updated_at: new Date().toISOString()
                            })
                            .eq("id", userId);

                        if (updateError) {
                            console.error('Error updating balance:', updateError);
                            throw updateError;
                        }

                        // Log payment
                        await supabaseAdmin.from("payments").insert({
                            user_id: userId,
                            amount: amountTotal,
                            method: 'stripe',
                            status: 'completed',
                            created_at: new Date().toISOString()
                        });

                        console.log(`Success: Added ${amountTotal} to user ${userId}. New Balance: ${newBalance}`);
                    }
                }
            }
        }

        // Handle subscription events to keep status in sync
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const status = subscription.status;

            const supabaseAdmin = createClient(
                Deno.env.get("SUPABASE_URL") ?? "",
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
            );

            // Mapear status do Stripe para nosso status
            let appStatus = 'inactive';
            if (status === 'active' || status === 'trialing') appStatus = 'active';
            else if (status === 'past_due') appStatus = 'past_due';
            else appStatus = 'canceled';

            // Se deletado/cancelado, voltar para plano free após o fim do período?
            // Por simplificação, se cancelado, setamos como free imediatamente ou mantemos até o fim do periodo se tivessemos webhook de invoice pago.
            // Aqui vamos apenas atualizar o status.

            const updateData: any = { subscription_status: appStatus };
            if (appStatus !== 'active') {
                // Opicionalmente reverter para free se cancelado definitivamente
                // updateData.plan_type = 'free'; 
            }

            await supabaseAdmin
                .from('profiles')
                .update(updateData)
                .eq('stripe_customer_id', customerId);

            console.log(`Updated subscription status for customer ${customerId} to ${appStatus}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(`Webhook Error: ${(err as Error).message}`);
        return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
    }
});
