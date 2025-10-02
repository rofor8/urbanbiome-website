import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { TinaCMS, TinaProvider } from 'tinacms';
import { useMemo } from 'react';

interface AdminAppProps {
  publishableKey: string;
}

function AdminContent() {
  const { user, isLoaded } = useUser();

  const cms = useMemo(() => {
    return new TinaCMS({
      enabled: true,
      sidebar: {
        position: 'overlay',
      },
    });
  }, []);

  // Check if user has admin role in public metadata
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Debug logging (remove after testing)
  console.log('User metadata check:', {
    userId: user?.id,
    publicMetadata: user?.publicMetadata,
    isAdmin
  });

  // Show loading state while user data loads
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#f5f5f5'
      }}>
        <div style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  // Show access denied if user doesn't have admin role
  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#f5f5f5'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '20px'
          }}>
            🔒
          </div>
          <h1 style={{
            color: '#dc2626',
            marginTop: 0,
            marginBottom: '10px',
            fontSize: '1.75rem'
          }}>
            Access Denied
          </h1>
          <p style={{
            marginBottom: '20px',
            color: '#666',
            fontSize: '0.95rem',
            lineHeight: 1.6
          }}>
            You don't have permission to access the admin panel. Only users with admin role can edit content.
          </p>
          <p style={{
            marginBottom: '30px',
            color: '#999',
            fontSize: '0.85rem'
          }}>
            Contact support@urbanbiome.co.uk if you need access.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a
              href="/"
              style={{
                padding: '12px 24px',
                backgroundColor: '#2c5f2d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Back to Home
            </a>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    );
  }

  // User is admin - show TinaCMS editor
  return (
    <TinaProvider cms={cms}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 20px',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.1rem',
            color: '#2c5f2d',
            fontWeight: 600
          }}>
            🌿 Urban Biome CMS
          </h2>
          <span style={{
            fontSize: '0.85rem',
            color: '#666',
            padding: '4px 8px',
            background: '#f0f0f0',
            borderRadius: '4px'
          }}>
            Editing Mode
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="/"
            style={{
              color: '#2c5f2d',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Site
          </a>
          <UserButton afterSignOutUrl="/admin" />
        </div>
      </div>

      <div style={{
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Welcome to the Content Editor</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              To edit your site content:
            </p>
            <ol style={{ color: '#666', lineHeight: 1.8 }}>
              <li>Click on <strong>"Sections"</strong> in the TinaCMS sidebar (click the pencil icon on the right)</li>
              <li>Select a section to edit its content</li>
              <li>Make your changes in the editor</li>
              <li>Click <strong>"Save"</strong> to commit changes to GitHub</li>
              <li>Your site will automatically rebuild in about 1 minute</li>
            </ol>
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '6px'
            }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
                <strong>💡 Tip:</strong> Changes are saved to GitHub and will trigger an automatic deployment.
                It may take a minute or two for changes to appear on the live site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TinaProvider>
  );
}

export default function AdminApp({ publishableKey }: AdminAppProps) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <SignedOut>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#f5f5f5'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h1 style={{
              color: '#2c5f2d',
              marginTop: 0,
              marginBottom: '10px',
              fontSize: '1.75rem'
            }}>
              Urban Biome Admin
            </h1>
            <p style={{
              marginBottom: '30px',
              color: '#666',
              fontSize: '0.95rem'
            }}>
              Please sign in to access the content editor
            </p>
            <SignInButton mode="modal">
              <button style={{
                padding: '14px 28px',
                backgroundColor: '#2c5f2d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#234a23'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2c5f2d'}
              >
                Sign In to Edit
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <AdminContent />
      </SignedIn>
    </ClerkProvider>
  );
}
