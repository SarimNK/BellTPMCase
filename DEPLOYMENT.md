# Deployment Guide - Bell AI Slide Generator

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Netlify Deployment

### Method 1: Git Integration (Recommended)

1. **Push to Git Repository:**
   - Create a repository on GitHub, GitLab, or Bitbucket
   - Push your code to the repository

2. **Connect to Netlify:**
   - Go to [Netlify](https://www.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

3. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These are already configured in `netlify.toml`

4. **Deploy:**
   - Netlify will automatically deploy on every push to your main branch

### Method 2: Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Option A: Drag and drop the `dist` folder to Netlify's deploy interface
   - Option B: Use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

### Method 3: Netlify CLI (Advanced)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize site:**
   ```bash
   netlify init
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## Environment Variables

Currently, no environment variables are required. If you need to add API keys in the future:

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add your variables
3. Rebuild the site

## Troubleshooting

### Build Fails

- Check Node.js version (requires 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript/ESLint errors

### Routing Issues

- The `netlify.toml` includes SPA redirect rules
- If routes don't work, ensure the redirect is configured:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

### PPTX Export Not Working

- Ensure `pptxgenjs` is installed: `npm install pptxgenjs`
- Check browser console for errors
- Some browsers may block downloads - check browser settings

## Post-Deployment Checklist

- [ ] Test document upload functionality
- [ ] Test template selection
- [ ] Test slide generation
- [ ] Test slide editing
- [ ] Test version history
- [ ] Test PPTX export
- [ ] Test Bell Confidential watermark toggle
- [ ] Test project deletion
- [ ] Verify responsive design on mobile devices
- [ ] Test dark mode functionality

## Performance Optimization

The build is already optimized with:
- Code splitting via Vite
- Tree shaking
- Minification
- Asset optimization

For further optimization:
- Enable Netlify's CDN caching
- Add image optimization if needed
- Consider lazy loading for heavy components

## Support

For issues or questions:
1. Check the README.md for feature documentation
2. Review browser console for errors
3. Check Netlify build logs

