export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Handle callback from GitHub
  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code');
    
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
    
    const tokenData = await tokenResponse.json();
    
    // Send token back to the CMS
    const tokenJson = JSON.stringify(tokenData).replace(/"/g, '&quot;');
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Complete</title>
      </head>
      <body>
        <script>
          (function() {
            window.opener.postMessage(
              'authorization:github:success:' + ${JSON.stringify(tokenJson)},
              window.location.origin
            );
            window.close();
          })();
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
  
  // Initial auth request - redirect to GitHub
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = url.origin + '/api/auth';
  const scope = 'repo,user';
  
  const githubAuthUrl = 'https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=' + scope;
  
  return Response.redirect(githubAuthUrl, 302);
}
