// src/pages/api/check-admin.js
// Endpoint to check if the current user is an admin
import { getAuthenticatedUser } from '../../lib/clerkAuth.js';

export const prerender = false;

export async function GET({ request, locals }) {
    const { env } = locals.runtime;

    // Get authenticated user
    const user = await getAuthenticatedUser(request, env);

    if (!user) {
        return new Response(JSON.stringify({
            isAdmin: false,
            error: 'Not authenticated'
        }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Check if user is admin from privateMetadata
    const isAdmin = user.privateMetadata?.role === 'admin';

    return new Response(JSON.stringify({
        isAdmin,
        userId: user.sub
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        }
    });
}
