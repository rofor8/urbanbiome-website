// File: functions/wiki/[id].js
// This function handles requests like /wiki/some-intervention-id
// It serves the static /wiki/index.html file, allowing the client-side
// script within that file to parse the ID from window.location.pathname.

export async function onRequest(context) {
  // context includes: request, env, params, waitUntil, next, data
  // params.id will contain the intervention ID from the URL path segment

  // Fetch the static asset /wiki/index.html
  // Note: Use the full path from the project root
  try {
    // Use context.next() to fetch the asset as if it were a static file
    // This ensures correct MIME types and potentially leverages caching
    const asset = await context.next("/wiki/index.html");
    return asset;
  } catch (error) {
      console.error("Error fetching static asset /wiki/index.html:", error);
      return new Response("Wiki page handler failed.", { status: 500 });
  }
} 