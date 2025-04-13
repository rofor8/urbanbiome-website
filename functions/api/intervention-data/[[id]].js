export async function onRequestGet(context) {
  // context includes: request, env, params, waitUntil, next, data
  const { request, env, params } = context;

  // Check if the required KV binding exists
  if (!env.INTERVENTION_DATA_KV) {
    console.error("KV namespace binding 'INTERVENTION_DATA_KV' not found.");
    return new Response(JSON.stringify({ error: "Server configuration error: KV binding missing." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get the intervention ID from the URL path parameters
  // The filename [[id]].js means the parameter name is 'id'
  // It's an array because [[id]] captures optional catch-all routes
  const idParam = params.id;
  if (!idParam || idParam.length === 0) {
      return new Response(JSON.stringify({ error: "Intervention ID is required." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
  }
  // Assuming the ID is the first (and only) segment captured
  const interventionId = idParam[0]; 

  try {
    // Fetch the data string from KV using the intervention ID as the key
    const dataString = await env.INTERVENTION_DATA_KV.get(interventionId);

    if (dataString === null) {
      return new Response(JSON.stringify({ error: `Intervention data not found for ID: ${interventionId}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // The data stored in KV is itself a JSON string, parse it
    const data = JSON.parse(dataString);

    // Return the parsed data as a JSON response
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error fetching/parsing data for ID ${interventionId}:`, error);
    // Differentiate between parsing errors and other potential KV errors
    if (error instanceof SyntaxError) {
         return new Response(JSON.stringify({ error: "Failed to parse intervention data from storage." }), {
           status: 500,
           headers: { 'Content-Type': 'application/json' },
         });
    } else {
        return new Response(JSON.stringify({ error: "Failed to retrieve intervention data." }), {
           status: 500,
           headers: { 'Content-Type': 'application/json' },
        });
    }
  }
} 