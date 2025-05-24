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

### Deployment output

~/workspace/trade-wars/web/ [05:06:28]$ site-builder publish ./dist --epochs 30
2025-05-24T03:07:13.559339Z  INFO site_builder: initializing site builder
2025-05-24T03:07:13.562580Z  INFO site_builder: loading sites configuration config_path="./sites-config.yaml"
2025-05-24T03:07:13.564072Z  INFO site_builder::config: loading the multi config context="testnet"
2025-05-24T03:07:13.564131Z  INFO site_builder: configuration loaded config=Config { portal: "wal.app", package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799, general: GeneralArgs { rpc_url: None, wallet: None, wallet_env: Some("testnet"), wallet_address: None, walrus_context: Some("testnet"), walrus_binary: Some("walrus"), walrus_config: None, walrus_package: None, gas_budget: Some(500000000) } }
Parsing the directory ./dist and locally computing blob IDs ... [Ok]
2025-05-24T03:07:15.831804Z  INFO site_builder::util: using Sui wallet configuration conf_path=/Users/alilloig/.sui/sui_config/client.yaml
2025-05-24T03:07:15.834400Z  INFO site_builder::util: set the wallet env target_env="testnet"
2025-05-24T03:07:15.834404Z  INFO site_builder::util: no wallet address provided, using the default one active_address=Some(0x2aee3e2b65bb06ca8159c0c5b66455256e3b1f04ca7c944e5e87054ad4724dc2)
Storing resources on Walrus: batch 1 of 1 ... [Ok]
Applying the Walrus Site object updates on Sui ... [Ok]

Execution completed
Resource operations performed:
  - created resource /assets/index-C-mLiqhq.css with blob ID hNCn7LS_CXsmyW8MUFG3OzOe-MMCffekOWMjfZSxPJE
  - created resource /assets/index-PchfehO9.js with blob ID y96fScNXBFzFKI4Tdp6VkWcQUxsOOLN5yKbjSIfaBtw
  - created resource /background.png with blob ID YzDt0p1ZXRIlHQQM0tgv5dTnqY8fNRAwfHuOqIfr-b8
  - created resource /cargo_ship.png with blob ID g8-fbVfjFH_c68mDemSClwGhF004aVMe4LDb0E8eMVw
  - created resource /index.html with blob ID uYmjb3CSx7zYzdgrYGbb_yyTbQGc-ESnzw4HmB2ziZ4
  - created resource /planet1.png with blob ID ScfH3YajLyOmmEVvTBScMPQuOm-kieg7JMOdNYcEdVQ
  - created resource /planet2.png with blob ID aWQ9OtUwP6oSvwuthG2AeAv3g8s1GCPihlw-kIBPkVY
  - created resource /planet3.png with blob ID _T862Yj0ZDjC0cctpnX3txhoLUO603SoC4wqFa3WvMk
  - created resource /system.png with blob ID VYJ-d3NlCV7c9GLbQbeKEFaGB8GQz46YAnAm3MTW_Mw
  - created resource /tradewars.png with blob ID UYKzthcIIhCIrPcrnfHhLFD6RQk3zoln8R3xcaUh7N0
The site routes were left unchanged

Created new site: Test Site
New site object ID: 0x2ed732f4964ad8cb8f3fafe3fa8b742117c3612c56d7f36d642bca39500c88d6
To browse the site, you have the following options:
        1. Run a local portal, and browse the site through it: e.g. http://1610n254uovg9ahh38yob79m82w96kaib3l31y7zn7vc661zo6.localhost:3000
           (more info: https://docs.wal.app/walrus-sites/portal.html#running-the-portal-locally)
        2. Use a third-party portal (e.g. wal.app), which will require a SuiNS name.
           First, buy a SuiNS name at suins.io (e.g. example-domain), then point it to the site object ID.
           Finally, browse it with: https://example-domain.wal.app