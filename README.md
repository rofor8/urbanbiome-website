# Urban Biome Website

Static website for Urban Biome, built with Astro and deployed on Cloudflare Pages.

## 🚀 Quick Start

```sh
npm install
npm run dev
```

Visit `http://localhost:4321` to see the site.

## 📝 Content Management

This site uses [Decap CMS](https://decapcms.org/) for content management, accessible at `/admin/`.

### CMS Access

1. Navigate to `https://urbanbiome.co.uk/admin/`
2. Click "Login with GitHub"
3. Authenticate with your GitHub account
4. Only users with write access to the repository can edit content

### Editing Content

- **Page Sections**: Create and edit sections that appear on the homepage
- **Site Settings**: Modify site title and color scheme
- **Media**: Upload and manage images

All changes are committed directly to the GitHub repository.

## 🔒 Security

### Authentication

- Admin access protected by GitHub OAuth
- Only repository collaborators can authenticate
- OAuth flow validates all tokens and handles errors securely

### Security Features

- Content Security Policy (CSP) headers on OAuth callback
- XSS protection via token escaping
- Input validation on all OAuth endpoints
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Environment variable validation

### Environment Variables

Required environment variables (set in Cloudflare Pages dashboard):

- `GITHUB_CLIENT_ID`: GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App client secret

See `.env.example` for setup instructions.

## 🏗️ Project Structure

```
/
├── public/
│   ├── admin/              # Decap CMS admin interface
│   │   ├── index.html      # CMS entry point
│   │   └── config.yml      # CMS configuration
│   └── images/             # Uploaded media files
├── src/
│   ├── content/
│   │   ├── sections/       # Homepage sections (markdown)
│   │   └── settings/       # Site configuration (JSON)
│   ├── components/         # Astro components
│   ├── layouts/            # Page layouts
│   └── pages/              # Site pages
├── functions/
│   └── api/
│       └── auth.js         # GitHub OAuth handler
└── package.json
```

## 🧞 Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |

## 🚢 Deployment

The site is automatically deployed to Cloudflare Pages on every push to `main`.

### Initial Setup

1. Create GitHub OAuth App at https://github.com/settings/developers
   - Homepage URL: `https://urbanbiome.co.uk`
   - Callback URL: `https://urbanbiome.co.uk/api/auth`

2. Add environment variables in Cloudflare Pages dashboard:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

3. Deploy to Cloudflare Pages

## 📚 Documentation

- [Astro Documentation](https://docs.astro.build)
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

## 🔐 Security Notes

### Rate Limiting

For high-traffic scenarios, consider implementing rate limiting on the `/api/auth` endpoint using Cloudflare Workers KV or Durable Objects to prevent OAuth abuse.

### CDN Security

The Decap CMS library is loaded from unpkg CDN. For stricter security:
- Consider self-hosting the Decap CMS library
- Enable Subresource Integrity (SRI) if self-hosting

### Repository Access

Keep the list of repository collaborators minimal and audit regularly, as they have full CMS access.

## 🛠️ Troubleshooting

### CMS Login Issues

1. Verify GitHub OAuth app settings match deployment URL
2. Check environment variables are set in Cloudflare Pages
3. Ensure user has write access to the repository
4. Check browser console for specific error messages

### Content Not Updating

1. Check GitHub repository for new commits
2. Verify Cloudflare Pages build completed successfully
3. Clear browser cache
