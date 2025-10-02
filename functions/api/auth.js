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
              console.log('Full token response:', tokenData);

              // Decap CMS expects this specific format
              const postMsgContent = {
                token: tokenData.access_token,
                provider: 'github'
              };

              const message = 'authorization:github:success:' + JSON.stringify(postMsgContent);
              console.log('Sending message:', message);
              console.log('window.opener exists:', !!window.opener);

              // Send message to parent window (opener for popup, parent for iframe)
              const target = window.opener || window.parent;
              if (target && target !== window) {
                console.log('Sending to target origin: *');
                target.postMessage(message, '*');

                // Also try posting to specific origin
                try {
                  target.postMessage(message, window.location.origin);
                  console.log('Also sent to:', window.location.origin);
                } catch (e) {
                  console.log('Could not send to specific origin:', e.message);
                }

                setTimeout(function() {
                  console.log('Closing window...');
                  window.close();
                }, 2000);
              } else {
                console.error('No parent window found');
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
