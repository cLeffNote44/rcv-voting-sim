# Deployment Guide for RCV Voting Simulator

> **⚠️ DEPRECATED**: This file is outdated. Please use **[DEPLOY.md](DEPLOY.md)** for comprehensive deployment instructions.
>
> DEPLOY.md includes:
> - 5 deployment platforms (vs 4 here)
> - Pre-deployment checklist
> - Platform-specific environment variable setup
> - Post-deployment verification steps
> - Security considerations
> - Analytics integration
> - Troubleshooting guide

---

## Prerequisites
- Node.js and npm installed
- Built project (`npm run build`)

## Deployment Options

### 1. Netlify (Recommended - Easiest)

#### Method A: Drag & Drop
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to the Netlify dashboard
4. Your site is live!

#### Method B: Git Integration
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Auto-deploys on every push

### 2. Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

### 3. GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy

# Enable GitHub Pages in repo settings
```

### 4. Surge.sh (Quickest)

```bash
# Build and deploy
npm run build
npx surge dist

# Choose your domain
```

## Custom Domain

All services above support custom domains:
- Point your domain's DNS to the service
- Add domain in the service's dashboard
- SSL certificates are automatic

## Environment Variables

If you need to hide the seed or set defaults:
- Create `.env` file
- Add `VITE_DEFAULT_SEED=your-seed`
- Access with `import.meta.env.VITE_DEFAULT_SEED`

## Post-Deployment

1. Test all functionality
2. Check mobile responsiveness
3. Verify charts render correctly
4. Test the Rules modal
5. Ensure voting flow works

## Updating

- **Netlify/Vercel with Git**: Just push to your repo
- **Manual**: Run build and re-upload/deploy
- **GitHub Pages**: Run `npm run deploy`

## Support

- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Docs](https://pages.github.com)
- [Surge Docs](https://surge.sh/help)
