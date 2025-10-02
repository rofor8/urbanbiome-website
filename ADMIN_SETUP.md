# Admin Panel Setup Guide

## Overview

The Urban Biome website has a built-in Content Management System (CMS) that allows non-technical staff to edit content directly on the website.

## Features

- ✅ Edit page sections (text, titles, ordering)
- ✅ Add/remove sections
- ✅ Upload and manage images
- ✅ Edit color schemes
- ✅ Secure authentication via Clerk
- ✅ Automatic GitHub commits and deployment
- ✅ Preview changes before publishing

## Setup Instructions

### 1. Configure Clerk Authentication

You can use the **same Clerk application** from the sightings app:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your existing application
3. Go to **Domains** in the sidebar
4. Add your website domain (e.g., `urbanbiome.co.uk` and `localhost:4321` for development)
5. Copy your **Publishable Key**

### 2. Create Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in the values:

```env
# From Clerk Dashboard
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# GitHub credentials for auto-commits
GITHUB_TOKEN=ghp_xxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=urbanbiome-website
GITHUB_BRANCH=main
```

### 3. Create GitHub Personal Access Token

The CMS needs to commit changes to GitHub on behalf of editors:

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name like "Urban Biome CMS"
4. Select scopes:
   - ✅ **repo** (full control of private repositories)
5. Click **Generate token**
6. Copy the token and add it to `.env` as `GITHUB_TOKEN`

### 4. Add Environment Variables to Cloudflare Pages

For production deployment:

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to **Settings** → **Environment variables**
4. Add the same variables from your `.env` file

### 5. Grant Clerk Access to Staff

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Go to **Users**
3. Invite staff members via email
4. They'll receive an invitation to create an account

**Note:** All authenticated users can access the admin panel. If you need role-based access control, you can configure that in Clerk.

## Using the Admin Panel

### Accessing the Editor

1. Go to `yoursite.com/admin` (or `localhost:4321/admin` in development)
2. Click **Sign In to Edit**
3. Sign in with your Clerk account

### Editing Content

#### Edit Existing Sections

1. Click the **pencil icon** on the right side (TinaCMS sidebar)
2. Click **"Sections"**
3. Select a section to edit
4. Make your changes in the editor
5. Click **Save** at the top

#### Add New Section

1. In the TinaCMS sidebar, click **"Sections"**
2. Click **"Create New"** button
3. Fill in:
   - Title (displayed on the page)
   - Order (number for sorting, e.g., 1, 2, 3)
   - Nav Title (optional, for navigation menu)
   - Content (markdown editor)
4. Click **Save**

#### Delete a Section

1. Select the section in TinaCMS sidebar
2. Click the **trash icon** or **Delete** button
3. Confirm deletion
4. Click **Save**

#### Upload Images

1. In the content editor, place your cursor where you want the image
2. Use the image button in the toolbar
3. Upload your image
4. Images are stored in `/public/` folder

#### Change Colors

1. In TinaCMS sidebar, click **"Site Settings"**
2. Expand **"Color Scheme"**
3. Use color pickers to change:
   - Primary Color
   - Secondary Color
   - Accent Color
   - Background Color
   - Text Color
4. Click **Save**

### How Changes Are Published

When you click **Save** in the admin panel:

1. ✅ Changes are committed to GitHub
2. ✅ Cloudflare Pages detects the commit
3. ✅ Site automatically rebuilds (~1-2 minutes)
4. ✅ Changes go live

**Note:** Changes are **not instant**. It takes 1-2 minutes for the site to rebuild and deploy.

## Troubleshooting

### "Missing environment variable" error

Make sure `.env` file exists and contains all required variables.

### Can't sign in

1. Check that `PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
2. Verify the domain is added in Clerk Dashboard
3. Clear browser cache and try again

### Changes not appearing on live site

1. Check GitHub repo - was the commit successful?
2. Check Cloudflare Pages - is the build running?
3. Wait 2-3 minutes for rebuild to complete

### Images not uploading

1. Check file size (should be < 5MB)
2. Try a different image format (PNG, JPG, WebP)
3. Check browser console for errors

## Development

### Running Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:4321/admin`

### Building for Production

```bash
npm run build
```

## Security Notes

- ✅ Admin panel requires authentication via Clerk
- ✅ GitHub token should be kept secret (never commit to repo)
- ✅ Only trusted staff should have Clerk accounts
- ✅ All changes are tracked in Git history

## Support

For issues or questions, contact: support@urbanbiome.co.uk
