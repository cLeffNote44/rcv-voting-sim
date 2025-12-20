# Deployment Guide

This guide covers deploying the RCV Voting Simulator to various hosting platforms.

## 🚀 Quick Deploy Options

### Option 1: Netlify (Recommended)

**Drag & Drop Method:**
1. Build the project: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder onto the page
4. Your site is live!

**Git Integration Method:**
1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

**Custom Domain:**
- Go to Site Settings → Domain Management
- Add your custom domain
- Update DNS records as instructed

### Option 2: Vercel

**CLI Method:**
```bash
npm install -g vercel
vercel
```

**Git Integration:**
1. Go to [Vercel](https://vercel.com)
2. Import your Git repository
3. Framework preset: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy!

### Option 3: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Update `vite.config.ts` base path:
```typescript
export default defineConfig({
  base: '/rcv-voting-sim/', // Your repo name
  // ... rest of config
})
```

3. Add deploy script to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages:
   - Go to Settings → Pages
   - Source: gh-pages branch
   - Your site: `https://username.github.io/rcv-voting-sim/`

### Option 4: Cloudflare Pages

1. Build the project: `npm run build`
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Create a new project
4. Connect your Git repository
5. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
6. Deploy!

### Option 5: AWS S3 + CloudFront

**Using AWS CLI:**
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Setup:**
1. Create S3 bucket with static website hosting enabled
2. Create CloudFront distribution pointing to S3
3. Configure custom domain in Route 53 (optional)

---

## 🔧 Environment Variables for Production

Create a `.env.production` file:

```bash
# Recommended for public demo
VITE_DEFAULT_SEED=demo2024
VITE_DEFAULT_VOTER_COUNT=5000
VITE_DEBUG_MODE=false

# Limits
VITE_MIN_VOTER_COUNT=100
VITE_MAX_VOTER_COUNT=50000
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Run tests: `npm test` (all tests passing)
- [ ] Build successfully: `npm run build` (no errors)
- [ ] Test production build: `npm run preview`
- [ ] Update meta tags in `index.html`:
  - [ ] Set correct `og:url`
  - [ ] Set correct `twitter:url`
  - [ ] Set correct `og:image` URL
- [ ] Update repository URLs in `README.md`
- [ ] Set environment variables (if using .env)
- [ ] Verify favicon appears correctly
- [ ] Test on mobile devices
- [ ] Check accessibility (colorblind themes work)
- [ ] Test share button (copies correct URL)
- [ ] Test CSV export downloads
- [ ] Test JSON export downloads
- [ ] Verify all visualizations render
- [ ] Check console for errors

---

## 📊 Post-Deployment Verification

After deployment:

1. **Functionality Test:**
   - [ ] Landing page loads
   - [ ] Can enter ballot and proceed to sim
   - [ ] Visualizations render correctly
   - [ ] Round controls work
   - [ ] Share button copies URL
   - [ ] Export buttons download files
   - [ ] Theme selector changes colors
   - [ ] Mobile responsive works

2. **Performance Test:**
   - [ ] Lighthouse score > 90 (run in Chrome DevTools)
   - [ ] First contentful paint < 2s
   - [ ] Time to interactive < 3s

3. **SEO Test:**
   - [ ] Meta tags visible in page source
   - [ ] Social sharing preview looks good (use [OpenGraph](https://www.opengraph.xyz/))
   - [ ] Favicon appears in browser tab

4. **Browser Compatibility:**
   - [ ] Chrome/Edge (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Mobile Safari (iOS)
   - [ ] Mobile Chrome (Android)

---

## 🔐 Security Considerations

- ✅ No secrets in client code (all env vars are public)
- ✅ No backend/API keys to manage
- ✅ Static site = minimal attack surface
- ✅ CSP headers (configured in hosting platform)
- ⚠️ If adding analytics, ensure GDPR compliance

**Recommended CSP Header (Netlify/Vercel):**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';
```

---

## 🎯 Custom Domain Setup

### Netlify
1. Site Settings → Domain Management → Add custom domain
2. Update your DNS provider:
   - Add A record: `75.2.60.5`
   - Or CNAME: `yoursite.netlify.app`
3. SSL automatically provisioned

### Vercel
1. Project Settings → Domains → Add domain
2. Update DNS:
   - Add A record: `76.76.21.21`
   - Or CNAME: `cname.vercel-dns.com`
3. SSL automatically provisioned

### GitHub Pages
1. Settings → Pages → Custom domain
2. Add CNAME file to repo root with your domain
3. Update DNS: CNAME to `username.github.io`
4. SSL automatically provisioned (may take 24 hours)

---

## 📈 Analytics Integration (Optional)

If you want to track usage:

**Google Analytics:**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible Analytics (Privacy-friendly):**
```html
<!-- Add to index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🐛 Troubleshooting

**Issue: Blank page after deployment**
- Check browser console for errors
- Verify `base` path in `vite.config.ts` matches hosting
- Ensure all files copied to dist

**Issue: 404 on page refresh**
- Configure SPA redirect in hosting:
  - Netlify: `netlify.toml` already configured
  - Vercel: `vercel.json` already configured
  - Other: Create `_redirects` or configure server

**Issue: Share button copies wrong URL**
- URL is based on `window.location.href`
- Ensure site is accessed via correct domain

**Issue: Visualizations don't appear**
- Check if D3.js loaded (check Network tab)
- Verify no CSP blocking scripts
- Check for JavaScript errors

---

## 🔄 Continuous Deployment

**Netlify/Vercel Auto-Deploy:**
- Push to `main` branch → automatic deploy
- Pull requests → preview deploys
- Configure branch deploys in settings

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/rcv-voting-sim/issues)
- Documentation: [CLAUDE.md](CLAUDE.md)
- Deployment Status: Check your hosting platform dashboard

---

**Happy Deploying! 🎉**
