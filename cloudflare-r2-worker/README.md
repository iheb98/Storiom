# Storiom R2 CDN Worker

Cloudflare Worker to serve images and files from your R2 bucket.

## Setup

### 1. Install dependencies

```bash
cd cloudflare-r2-worker
npm install
```

### 2. Configure wrangler.toml

Update `wrangler.toml` with your actual R2 bucket name:

```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "your-actual-bucket-name"  # <-- Change this
```

### 3. Login to Cloudflare

```bash
npx wrangler login
```

### 4. Test locally

```bash
npm run dev
```

This will start a local dev server. You can test by accessing:
- `http://localhost:8787/path/to/your/image.jpg`

### 5. Deploy to production

```bash
npm run deploy
```

After deployment, you'll get a URL like:
- `https://storiom-r2-worker.<your-account>.workers.dev`

### 6. Add Custom Domain (Recommended)

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your worker
3. Go to "Triggers" > "Custom Domains"
4. Add `cdn.storiom.com` (or your preferred subdomain)

Then update `wrangler.toml` routes:
```toml
routes = [
  { pattern = "cdn.storiom.com/*", zone_name = "storiom.com" }
]
```

### 7. Update Angular Environment

After deployment, update your Angular production environment:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  BASE_PATH: 'https://storiom.com/api',
  apiUrl: 'https://storiom.com/api',
  couleurs: ['Blanc', 'Noir', 'Rouge', 'Bleu'],
  backend: 'https://cdn.storiom.com'  // Your worker custom domain
};
```

## Features

- ✅ Serves files from R2 bucket
- ✅ CORS support for cross-origin requests
- ✅ Long-term caching (1 year)
- ✅ Proper content-type headers
- ✅ Error handling
- ✅ Security headers

## Troubleshooting

### CORS Issues
The worker includes full CORS support. If you still have issues, check the browser console for specific error messages.

### 404 Errors
Make sure the file path matches exactly what's stored in R2. Paths are case-sensitive.

### Caching Issues
Files are cached for 1 year. To bust the cache:
1. Rename the file in R2
2. Use query parameters: `image.jpg?v=2`
3. Purge cache in Cloudflare Dashboard
