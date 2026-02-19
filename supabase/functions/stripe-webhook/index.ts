import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

            // Amount is in cents, convert to integer unit
            const amountTotal = (session.amount_total || 0) / 100;

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

                    // Log payment in payments table
                    const { error: insertError } = await supabaseAdmin.from("payments").insert({
                        user_id: userId,
                        amount: amountTotal,
                        method: 'stripe',
                        status: 'completed',
                        created_at: new Date().toISOString()
                    });

                    if (insertError) {
                        console.error('Error inserting payment record:', insertError);
                        // Don't throw here, as balance was already updated
                    }

                    console.log(`Success: Added ${amountTotal} to user ${userId}. New Balance: ${newBalance}`);
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(`Webhook Error: ${(err as Error).message}`);
        return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
    }
});
