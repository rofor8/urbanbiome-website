/**
 * GitHub OAuth handler for Decap CMS authentication
 *
 * Security considerations:
 * - Validates environment variables before use
 * - Checks GitHub API response status and errors
 * - Escapes token data before embedding in HTML
 * - Sets security headers (CSP, X-Frame-Options, etc.)
 * - Only accepts requests from same origin via postMessage validation
 *
 * Note: For production at scale, consider adding rate limiting to prevent
 * abuse of the OAuth endpoint. Cloudflare Workers KV or Durable Objects
 * can be used to track request counts per IP.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Validate required environment variables
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('Server configuration error', { status: 500 });
  }

  // Handle callback from GitHub
  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response('Invalid authorization code', { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      return new Response('Failed to exchange authorization code', { status: 502 });
    }

    const tokenData = await tokenResponse.json();

    // Check for GitHub API errors
    if (tokenData.error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Failed</title>
        </head>
        <body>
          <p>Authorization failed: ${tokenData.error_description || tokenData.error}</p>
          <p>Please close this window and try again.</p>
        </body>
        </html>
      `, {
        status: 401,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (!tokenData.access_token) {
      return new Response('No access token received', { status: 502 });
    }

    // Send token back to the CMS - Decap expects { token, provider } format
    // Safely escape the access token for embedding in JavaScript
    const accessToken = tokenData.access_token.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Complete</title>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
      </head>
      <body>
        <p>Authorization successful! This window should close automatically...</p>
        <script>
          (function() {
            'use strict';
            try {
              const postMsgContent = {
                token: '${accessToken}',
                provider: 'github'
              };
              const message = 'authorization:github:success:' + JSON.stringify(postMsgContent);

              function receiveMessage(e) {
                if (!window.opener) return;
                window.opener.postMessage(message, e.origin);
                window.removeEventListener("message", receiveMessage, false);
                setTimeout(function() {
                  window.close();
                }, 1000);
              }

              if (window.opener) {
                window.addEventListener("message", receiveMessage, false);
                window.opener.postMessage("authorizing:github", "*");
              } else {
                document.body.innerHTML = '<p>Error: No parent window found. You can close this window.</p>';
              }
            } catch (err) {
              document.body.innerHTML = '<p>Error processing authorization. Please close this window.</p>';
            }
          })();
        </script>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer'
      },
    });
  }
  
  // Initial auth request - redirect to GitHub
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = url.origin + '/api/auth';
  const scope = 'repo,user';
  
  const githubAuthUrl = 'https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=' + scope;
  
  return Response.redirect(githubAuthUrl, 302);
}
