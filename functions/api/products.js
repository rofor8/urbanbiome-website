// /functions/api/products.js - Cloudflare Pages Function

/**
 * API endpoint to fetch product catalog from KV storage.
 * Ensure the 'PRODUCTS' KV namespace is bound to this function
 * in your Cloudflare Pages project settings.
 *
 * @param {EventContext<Env, any, { PRODUCTS: KVNamespace }>} context
 */
export async function onRequestGet(context) {
    try {
      // Env binding is automatically populated by Cloudflare Pages
      // if the binding is configured in the dashboard.
      const { env } = context;
  
      if (!env.PRODUCTS) {
          console.error("KV Namespace 'PRODUCTS' not bound.");
          return new Response('Server configuration error: KV Namespace not bound.', { status: 500 });
      }
  
      // Assuming the product catalog JSON is stored under the key 'catalog'
      const productCatalogJson = await env.PRODUCTS.get('catalog');
  
      if (!productCatalogJson) {
        console.error("Key 'catalog' not found in 'PRODUCTS' KV namespace.");
        return new Response('Product catalog data not found.', { status: 404 });
      }
  
      // Return the JSON data with appropriate headers
      return new Response(productCatalogJson, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*', // Consider restricting in production
          // Cache at the edge for performance (e.g., 1 hour)
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
  
    } catch (error) {
      console.error('Error fetching products from KV:', error);
      return new Response('Error fetching product data.', { status: 500 });
    }
  }
  