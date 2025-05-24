# Trade Wars Web App - Deployment Guide

## 🚀 Production Build

Your React app is now ready for deployment! Here's what you need to know:

### Build Commands

```bash
# Standard production build
npm run build

# Optimized build with image compression (recommended)
npm run build:optimized
```

### Build Output

- **Location**: `dist/` folder
- **Total Size**: ~2.3MB (after optimization)
- **Optimizations Applied**:
  - TypeScript compilation
  - Terser minification
  - Automatic code splitting
  - Image compression (PNG optimization)
  - CSS minification
  - Asset hashing for cache busting

### File Breakdown

```
dist/
├── index.html (2.1KB)
├── assets/
│   ├── index-[hash].css (702KB → 84KB gzipped)
│   └── index-[hash].js (539KB → 167KB gzipped)
└── *.png (optimized images, ~1.2MB total)
```

## 🌐 Hosting Options

### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### 2. Netlify
- Drag and drop the `dist/` folder to [netlify.com/drop](https://netlify.com/drop)
- Or use Netlify CLI: `netlify deploy --prod --dir=dist`

### 3. GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "npm run build:optimized && gh-pages -d dist"

# Deploy
npm run deploy
```

### 4. AWS S3 + CloudFront
- Upload `dist/` contents to S3 bucket
- Configure CloudFront distribution
- Set up custom domain (optional)

### 5. Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

## ⚙️ Environment Variables

Before deploying, make sure to set these environment variables in your hosting platform:

```bash
VITE_TRADE_WARS_PKG_DEV=your_package_id
VITE_TRADE_WARS_ID_DEV=your_trade_wars_id  
VITE_TRADE_WARS_INFO_DEV=your_trade_wars_info_id
```

## 🔧 Performance Features

- **Gzip Compression**: Assets are ~70% smaller when gzipped
- **Code Splitting**: Automatic vendor chunk separation
- **Image Optimization**: PNG files compressed by ~85%
- **Cache Busting**: Asset hashes ensure fresh deployments
- **Modern JS**: ES2020 target for smaller bundles

## 📊 Size Comparison

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| Images | 8.2MB | 1.2MB | 85% |
| Total Build | 13MB | 2.3MB | 82% |
| JS (gzipped) | - | 167KB | - |
| CSS (gzipped) | - | 84KB | - |

## 🚀 Quick Deploy

For the fastest deployment:

```bash
# Build optimized version
npm run build:optimized

# Deploy to Vercel (if installed)
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

Your Trade Wars app is now production-ready! 🎮 