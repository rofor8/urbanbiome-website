// Helper function to create responses with CORS headers
function createJsonResponse(body, status, allowedOrigin) {
    return new Response(JSON.stringify(body), {
      status: status,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin, // Add CORS header
          // Add other CORS headers if needed (e.g., for specific methods/headers)
          // 'Access-Control-Allow-Methods': 'GET, OPTIONS',
          // 'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
}

export async function onRequestGet(context) {
  // context includes: request, env, params, waitUntil, next, data
  const { request, env, params } = context;

  // Define the allowed origin (your gemini app's domain)
  // TODO: Consider making this an environment variable for flexibility
  const allowedOrigin = 'https://urbanbiome.app';

  // Check if the required KV binding exists
  if (!env.INTERVENTION_DATA_KV) {
    console.error("KV namespace binding 'INTERVENTION_DATA_KV' not found.");
    // Use helper function to include CORS header in error response
    return createJsonResponse({ error: "Server configuration error: KV binding missing." }, 500, allowedOrigin);
  }

  // Get the intervention ID from the URL path parameters
  // The filename [[id]].js means the parameter name is 'id'
  // It's an array because [[id]] captures optional catch-all routes
  const idParam = params.id;
  if (!idParam || idParam.length === 0) {
      // Use helper function for response
      return createJsonResponse({ error: "Intervention ID is required." }, 400, allowedOrigin);
  }
  // Assuming the ID is the first (and only) segment captured
  const interventionId = idParam[0]; 

  try {
    // Fetch the data directly as JSON from KV using the intervention ID as the key
    const data = await env.INTERVENTION_DATA_KV.get(interventionId, { type: "json" });

    if (data === null) {
        // Use helper function for response
        return createJsonResponse({ error: `Intervention data not found for ID: ${interventionId}` }, 404, allowedOrigin);
    }

    // No need to parse, 'data' is already the JSON object

    // Return the parsed data as a JSON response using the helper
    return createJsonResponse(data, 200, allowedOrigin);

  } catch (error) {
    console.error(`Error fetching data for ID ${interventionId}:`, error);
    // Handle potential errors (e.g., KV access issues, though parsing error is less likely now)
    // Note: A SyntaxError might still occur if the stored value isn't valid JSON, 
    // even when using { type: "json" }. The KV store might return null or throw.
    // Keeping a generic error might be safer.
    return createJsonResponse({ error: "Failed to retrieve intervention data." }, 500, allowedOrigin);
  }
}

// Optional: Handle OPTIONS requests for CORS preflight if needed
export async function onRequestOptions(context) {
     const allowedOrigin = 'https://urbanbiome.app'; // Needs to match allowedOrigin above
     return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allow GET and OPTIONS
            'Access-Control-Allow-Headers': 'Content-Type', // Allow standard headers
            'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
        }
     });
} 