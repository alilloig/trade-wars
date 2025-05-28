# Trade Wars - Walrus Deployment Guide

## 🐋 Deploying to Walrus Decentralized Storage

Your Trade Wars app is fully configured for Walrus deployment! Environment variables are embedded at build time, so no runtime configuration is needed.

## ✅ Environment Variables Already Configured

The following environment variables are already embedded in your `.env` file and will be included in the build:

```bash
VITE_TRADE_WARS_PKG_DEV=0x6034acdfee1ead79374f0ec8d6bc9a472c1cd7e0ee03e2a4c35c2b3403ac8719
VITE_TRADE_WARS_ID_DEV=0x56caed6e8a87c590a792ba6c7f24872323c8a85ebee5a2e0c09bcd8b1231c3d1
VITE_TRADE_WARS_INFO_DEV=0x97d18f04367a3ca8117848c6ad95290ff9bf84be425ae06fdb03e5682cd20342
VITE_ERB_SOURCE_ID_DEV=0x53b74c73944cea3d24388514c1023f00b5a1ba99bf2b5dc57ba95b3f5fa7a510
VITE_LAN_SOURCE_ID_DEV=0x48fcf4dd0a610818918e0988e44956247fa44cb4c6462080ee3522fcf3cfd1c0
VITE_THO_SOURCE_ID_DEV=0x648c59ed49a796cb8e808ff7db3f061d816a71bb98170cd34b53f16d8d83ad55
```

These values are **automatically embedded** into the JavaScript bundle during build time using Vite's environment variable system.

## 🚀 Deployment Steps

### 1. Build the Optimized App

```bash
cd web
npm run build:optimized
```

This will:
- ✅ Compile TypeScript
- ✅ Bundle and minify JavaScript/CSS  
- ✅ Embed environment variables into the bundle
- ✅ Optimize images (85% size reduction)
- ✅ Create production-ready `dist/` folder

### 2. Deploy to Walrus

Follow the standard Walrus deployment process with your `dist/` folder:

```bash
# Example Walrus deployment command
# (Replace with actual Walrus CLI command)
walrus-sites publish ./dist/
```

## 📊 Build Output (Ready for Walrus)

```
dist/
├── index.html (2.1KB)
├── assets/
│   ├── index-[hash].css (702KB → 84KB gzipped)
│   └── index-[hash].js (538KB → 167KB gzipped)
└── optimized images (~1.2MB total)
```

**Total Size**: ~2.3MB (perfect for decentralized storage!)

## 🔧 How Environment Variables Work

Unlike traditional hosting platforms, Walrus can't inject environment variables at runtime. Instead:

1. **Build Time Embedding**: Vite reads your `.env` file during `npm run build`
2. **Variable Replacement**: All `import.meta.env.VITE_*` references get replaced with actual values
3. **Bundle Integration**: The values become part of the JavaScript bundle
4. **No Runtime Dependency**: Your app works without any external configuration

### Example of Embedded Variables

In your source code:
```typescript
const packageId = import.meta.env.VITE_TRADE_WARS_PKG_DEV;
```

In the built bundle:
```javascript
const packageId = "0x6034acdfee1ead79374f0ec8d6bc9a472c1cd7e0ee03e2a4c35c2b3403ac8719";
```

## 🔄 Updating Environment Variables

If you need to update the contract addresses or other variables:

1. **Edit `.env` file**: Update values in `web/.env`
2. **Rebuild**: Run `npm run build:optimized`
3. **Redeploy**: Deploy the new `dist/` folder to Walrus

## ✅ Verification

To verify environment variables are embedded:

```bash
# Check if package ID is in the bundle
grep "0x6034acdfee1ead79374f0ec8d6bc9a472c1cd7e0ee03e2a4c35c2b3403ac8719" dist/assets/*.js

# Should return the embedded value
```

## 🌐 Benefits for Walrus

- ✅ **No Runtime Configuration**: App works immediately after deployment
- ✅ **Decentralized**: No dependency on external config services  
- ✅ **Fast Loading**: Variables are bundled, no additional requests
- ✅ **Cache Friendly**: Asset hashing ensures proper cache invalidation
- ✅ **Optimized Size**: 82% smaller than original build

Your Trade Wars app is now ready for decentralized deployment on Walrus! 🎮🐋 