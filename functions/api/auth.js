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

    // Send token back to the CMS - Decap expects { token, provider } format
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Complete</title>
      </head>
      <body>
        <p>Authorization successful! This window should close automatically...</p>
        <script>
          (function() {
            try {
              const tokenData = ${JSON.stringify(tokenData)};
              console.log('Token data:', tokenData);

              // Decap CMS expects this specific format
              const postMsgContent = {
                token: tokenData.access_token,
                provider: 'github'
              };

              // Send message to parent window
              if (window.opener) {
                window.opener.postMessage(
                  'authorization:github:success:' + JSON.stringify(postMsgContent),
                  '*'
                );
                setTimeout(function() {
                  window.close();
                }, 1000);
              } else {
                document.body.innerHTML = '<p>Error: No parent window found. You can close this window.</p>';
              }
            } catch (err) {
              console.error('Error:', err);
              document.body.innerHTML = '<p>Error: ' + err.message + '</p>';
            }
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
