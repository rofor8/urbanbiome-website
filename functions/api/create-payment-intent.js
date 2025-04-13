    // /functions/api/create-payment-intent.js

    // We need to install the Stripe Node library as a dev dependency
    // in our project if we haven't already: npm install --save-dev stripe
    // Cloudflare Pages build process should pick it up.
    import Stripe from 'stripe';

    // Define simple shipping tiers based on total weight (adjust as needed)
    // These are basic examples and may need complex logic based on destination
    const SHIPPING_TIERS_UK = [
        { maxWeightKg: 5, cost: 5.00 },
        { maxWeightKg: 10, cost: 8.00 },
        { maxWeightKg: 25, cost: 15.00 },
        { maxWeightKg: 50, cost: 25.00 },
        { maxWeightKg: 100, cost: 40.00 },
        { maxWeightKg: 500, cost: 75.00 },
        { maxWeightKg: 1000, cost: 120.00 },
        // Add a fallback for very heavy orders - might need custom quote logic later
        { maxWeightKg: Infinity, cost: 200.00 }
    ];

    // Helper function to calculate shipping cost
    function calculateShippingCost(totalWeightKg, countryCode = 'GB') {
        // Basic example: Use UK tiers if country is GB, otherwise a flat rate (or more complex logic)
        if (countryCode.toUpperCase() === 'GB') {
            const tier = SHIPPING_TIERS_UK.find(t => totalWeightKg <= t.maxWeightKg);
            return tier ? tier.cost : SHIPPING_TIERS_UK[SHIPPING_TIERS_UK.length - 1].cost; // Fallback to highest cost
        } else {
            // Example: Flat rate for international (or could add more tiers/logic)
            // This is highly simplified - real international shipping is complex!
            return 50.00; // Placeholder international rate
        }
    }

    // Define expected cart item structure (for validation, optional but good practice)
    // interface CartItem { [productId: string]: number } // Example if using TypeScript

    export async function onRequestPost(context) {
        // --- CORS Preflight Handling ---
        if (context.request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                'Access-Control-Allow-Origin': '*', // Restrict in production if possible
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Ensure it's a POST request
        if (context.request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        // --- Environment Setup & Validation ---
        const { env } = context;
        if (!env.PRODUCTS) {
            console.error("KV Namespace 'PRODUCTS' not bound.");
            return new Response(JSON.stringify({ error: 'Server configuration error: PRODUCTS KV not bound.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }
        if (!env.STRIPE_SECRET_KEY) {
            console.error("Stripe secret key not configured.");
            return new Response(JSON.stringify({ error: 'Server configuration error: Stripe key missing.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY);

        try {
            // --- Get Cart & Address Data from Request ---
            const { cartData, shippingAddress } = await context.request.json(); // Expect cart AND address

            // --- Basic Validation ---
            if (!cartData || typeof cartData !== 'object' || Object.keys(cartData).length === 0) {
                return new Response(JSON.stringify({ error: 'Invalid or empty cart data provided.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }
            // Basic address validation (Stripe Address Element provides better client-side validation)
            if (!shippingAddress || typeof shippingAddress !== 'object' || !shippingAddress.country || !shippingAddress.postal_code) {
                 return new Response(JSON.stringify({ error: 'Incomplete shipping address provided.' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
            }

            // --- Secure Server-Side Calculation (Subtotal & Weight) ---
            const productCatalogString = await env.PRODUCTS.get('catalog');
            if (!productCatalogString) {
                console.error("Key 'catalog' not found in 'PRODUCTS' KV namespace.");
                return new Response(JSON.stringify({ error: 'Product catalog data not found.' }), {
                    status: 500, // Internal error, not client's fault
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }
            const allProducts = JSON.parse(productCatalogString);
            let itemSubtotal = 0; // In pence/cents
            let totalWeightKg = 0;

            for (const productId in cartData) {
                const quantity = parseInt(cartData[productId], 10);
                if (isNaN(quantity) || quantity <= 0) continue; // Skip invalid

                const product = allProducts.find(p => p.id === productId);
                 // Ensure price and weight are numbers
                if (!product || typeof product.price !== 'number' || typeof product.weightKg !== 'number') {
                    console.warn(`Product ${productId} missing, or has invalid price/weight.`);
                    continue; // Skip invalid products
                }

                itemSubtotal += Math.round(product.price * 100) * quantity;
                totalWeightKg += product.weightKg * quantity;
            }

            if (itemSubtotal <= 0) {
                 return new Response(JSON.stringify({ error: 'Calculated item subtotal is zero or negative.' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
            }

            // --- Calculate Shipping Cost ---
            const shippingCost = calculateShippingCost(totalWeightKg, shippingAddress.country);
            const shippingCostPence = Math.round(shippingCost * 100);

            // --- Calculate Final Total ---
            const finalTotalPence = itemSubtotal + shippingCostPence;

            // --- Create Stripe Payment Intent ---
            const paymentIntent = await stripe.paymentIntents.create({
                amount: finalTotalPence, // Use the FINAL calculated amount
                currency: 'gbp',
                automatic_payment_methods: { enabled: true },
                 // Include shipping details collected for Stripe record keeping & potential validation
                 shipping: {
                    name: shippingAddress.name || 'N/A', // Get name from Address Element if available
                    address: {
                        line1: shippingAddress.line1 || null,
                        line2: shippingAddress.line2 || null,
                        city: shippingAddress.city || null,
                        state: shippingAddress.state || null,
                        postal_code: shippingAddress.postal_code,
                        country: shippingAddress.country,
                    },
                },
                // Optional: Add metadata about the order breakdown
                // metadata: {
                //     cart: JSON.stringify(cartData),
                //     item_subtotal_pence: itemSubtotal,
                //     shipping_cost_pence: shippingCostPence
                // }
            });

            // --- Return Client Secret and Calculation Details ---
            return new Response(
                JSON.stringify({
                    clientSecret: paymentIntent.client_secret,
                    calculatedShippingCost: shippingCost.toFixed(2),
                    calculatedFinalTotal: (finalTotalPence / 100).toFixed(2)
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );

        } catch (error) {
            console.error('Error processing payment intent:', error);
            const status = error instanceof SyntaxError ? 400 : 500; // Handle bad JSON request
            return new Response(
                JSON.stringify({ error: error.message || 'Failed to process payment intent.' }), {
                    status: status,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }
    }

    // Handler for other methods (GET, etc.) - Optional
    export async function onRequest(context) {
         if (context.request.method === 'OPTIONS') {
             return new Response(null, {
                headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
         }
        return new Response('Method Not Allowed', { status: 405 });
    }