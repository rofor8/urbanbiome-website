# TinaCMS Setup Complete! ✅

## What's Been Installed

✅ TinaCMS - Content management system
✅ Clerk Authentication - Secure login for editors
✅ Astro React Integration - For the admin UI
✅ Admin page at `/admin`
✅ Color scheme editor
✅ Section content editor

## Next Steps

### 1. Add Environment Variables to Cloudflare Pages

Go to your Cloudflare Pages dashboard → Settings → Environment variables

Add these variables (for both **Production** and **Preview**):

```
PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_... (from Clerk dashboard)
```

**Note:** You can use the same Clerk app from the sightings project! Just add your website domain to the allowed origins in Clerk.

### 2. Test Locally (Optional)

If you want to test locally first:

1. Create a `.env` file (already in .gitignore):
   ```bash
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:4321/admin`

### 3. Deploy to Cloudflare Pages

Just push to GitHub - Cloudflare will automatically build and deploy!

```bash
git add .
git commit -m "Add TinaCMS admin panel with Clerk auth"
git push
```

### 4. Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your app (or create new one)
3. Add your domains:
   - `urbanbiome.co.uk` (production)
   - `localhost:4321` (development)
   - Any Cloudflare Pages preview URLs

### 5. Invite Staff Members

In Clerk Dashboard:
1. Go to **Users**
2. Click **Invite User**
3. Enter their email
4. They'll receive an invitation to sign up

## How It Works

### For Editors:

1. Go to `yoursite.com/admin`
2. Sign in with Clerk
3. Click the **pencil icon** (TinaCMS sidebar)
4. Select **Sections** to edit content
5. Click **Save** to publish changes
6. Changes commit to GitHub automatically
7. Site rebuilds in ~1-2 minutes

### Features Available:

- ✅ Edit section titles and content
- ✅ Add new sections
- ✅ Delete sections
- ✅ Reorder sections (change order number)
- ✅ Upload images
- ✅ Edit color scheme
- ✅ Rich text editor with markdown support

## File Structure

```
/
├── src/
│   ├── components/
│   │   └── AdminApp.tsx          # Admin UI component
│   ├── content/
│   │   ├── sections/             # Editable content sections
│   │   └── settings/
│   │       └── site.json         # Color scheme settings
│   └── pages/
│       └── admin.astro           # Admin page route
├── tina/
│   └── config.ts                 # TinaCMS configuration
├── .env.example                  # Environment variable template
└── ADMIN_SETUP.md               # Full setup guide
```

## Security

- ✅ Admin requires Clerk authentication
- ✅ Environment variables stored in Cloudflare (not in code)
- ✅ All changes tracked in Git history
- ✅ Only invited users can access admin

## Troubleshooting

**Q: Admin page shows blank screen**
A: Check that `PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Cloudflare Pages environment variables

**Q: Can't sign in**
A: Make sure your domain is added in Clerk Dashboard → Domains

**Q: TinaCMS sidebar not showing**
A: Click the pencil icon on the right side of the screen

**Q: Changes not saving**
A: Check browser console for errors. Make sure you're signed in.

## Documentation

- Full setup guide: `ADMIN_SETUP.md`
- TinaCMS docs: https://tina.io/docs
- Clerk docs: https://clerk.com/docs

## Support

Questions? Contact: support@urbanbiome.co.uk
