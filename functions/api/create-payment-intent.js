    // /functions/api/create-payment-intent.js

    // We need to install the Stripe Node library as a dev dependency
    // in our project if we haven't already: npm install --save-dev stripe
    // Cloudflare Pages build process should pick it up.
    import Stripe from 'stripe';

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
            // --- Get Cart Data from Request ---
            const cartData = await context.request.json(); // Expects {[productId]: quantity}

            // Basic validation of cart data
            if (!cartData || typeof cartData !== 'object' || Object.keys(cartData).length === 0) {
                return new Response(JSON.stringify({ error: 'Invalid or empty cart data provided.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }

            // --- Secure Server-Side Calculation ---
            const productCatalogString = await env.PRODUCTS.get('catalog');
            if (!productCatalogString) {
                console.error("Key 'catalog' not found in 'PRODUCTS' KV namespace.");
                return new Response(JSON.stringify({ error: 'Product catalog data not found.' }), {
                    status: 500, // Internal error, not client's fault
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }

            const allProducts = JSON.parse(productCatalogString);
            let totalAmount = 0; // In pence/cents

            for (const productId in cartData) {
                const quantity = parseInt(cartData[productId], 10);
                if (isNaN(quantity) || quantity <= 0) {
                    console.warn(`Invalid quantity for product ${productId}`);
                    continue; // Skip invalid items
                }

                const product = allProducts.find(p => p.id === productId);
                if (!product || typeof product.price !== 'number') {
                    console.warn(`Product ${productId} not found in catalog or has invalid price.`);
                    // Decide how to handle: skip, error out, etc. Skipping for now.
                    continue;
                }

                // Ensure price is treated as pounds/dollars and convert to pence/cents
                totalAmount += Math.round(product.price * 100) * quantity;
            }

            if (totalAmount <= 0) {
                 return new Response(JSON.stringify({ error: 'Calculated total amount is zero or negative.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }

            // --- Create Stripe Payment Intent ---
            const paymentIntent = await stripe.paymentIntents.create({
                amount: totalAmount, // Use the securely calculated amount
                currency: 'gbp', // Or your desired currency
                automatic_payment_methods: {
                    enabled: true, // Use Stripe's recommended automatic methods
                },
                // Add metadata if needed (e.g., linking to an order ID later)
                // metadata: { order_details: JSON.stringify(cartData) }
            });

            // --- Return Client Secret ---
            return new Response(
                JSON.stringify({
                    clientSecret: paymentIntent.client_secret,
                    // You might want to return the calculated total for display confirmation
                    // totalAmount: (totalAmount / 100).toFixed(2)
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*', // Adjust CORS as needed
                    },
                }
            );

        } catch (error) {
            console.error('Error processing payment intent:', error);
            // Differentiate between client errors (e.g., bad JSON) and server errors
            const status = error instanceof SyntaxError ? 400 : 500;
            return new Response(
                JSON.stringify({ error: error.message || 'Failed to create payment intent.' }), {
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