// File: functions/wiki/[id].js
// This function handles requests like /wiki/some-intervention-id
// It serves the static /wiki/index.html file, allowing the client-side
// script within that file to parse the ID from window.location.pathname.

export async function onRequest(context) {
  // context includes: request, env, params, waitUntil, next, data
  // params.id will contain the intervention ID from the URL path segment
  const { env, request } = context;

  // Check if the ASSETS binding exists
  if (!env.ASSETS) {
    console.error("ASSETS binding is missing. Cannot fetch static files.");
    return new Response("Server configuration error.", { status: 500 });
  }

  // Construct the URL for the static asset /wiki/index.html
  const assetUrl = new URL("/wiki/index.html", request.url); 

  try {
    // Fetch the static asset directly using env.ASSETS.fetch()
    console.log(`Function trying to fetch asset: ${assetUrl.pathname}`);
    const asset = await env.ASSETS.fetch(assetUrl);
    return asset;
  } catch (error) {
      console.error(`Error fetching static asset ${assetUrl.pathname} via env.ASSETS.fetch():`, error);
      // Attempt fallback using context.next() just in case ASSETS has issues
      try {
          console.warn("env.ASSETS.fetch failed, attempting fallback with context.next()");
          const fallbackAsset = await context.next("/wiki/index.html");
          return fallbackAsset;
      } catch (nextError) {
          console.error("Fallback context.next() also failed:", nextError);
          return new Response("Wiki page handler failed to fetch asset.", { status: 500 });
      }
  }
} 