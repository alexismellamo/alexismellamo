# Quick Start Guide

## Environment Variables - Where They Go

### 📁 `.dev.vars` (Local Testing)
**Location**: `lastfm-worker/.dev.vars`  
**Purpose**: Secrets for local development  
**Status**: ✅ Created (git-ignored)

```
LASTFM_API_KEY=your-actual-api-key-here
```

### 📁 `wrangler.toml` (Configuration)
**Location**: `lastfm-worker/wrangler.toml`  
**Purpose**: Public config and worker settings

```toml
[vars]
LASTFM_USERNAME = "your-lastfm-username"
```

### ☁️ Cloudflare Secrets (Production)
**After deploying**, set secrets via CLI:

```bash
npx wrangler secret put LASTFM_API_KEY
```

## Testing Workflow

### Step 1: Setup
```bash
cd lastfm-worker
npm install
```

### Step 2: Configure
1. Edit `.dev.vars` - add your Last.fm API key
2. Edit `wrangler.toml` - add your Last.fm username

### Step 3: Test Locally
```bash
npm run dev
```

Then open in browser:
- http://localhost:8787/now-playing
- http://localhost:8787/recent-tracks

### Step 4: Deploy
```bash
npm run deploy
```

### Step 5: Set Production Secret
```bash
npx wrangler secret put LASTFM_API_KEY
```

### Step 6: Test Production
Visit:
- https://your-worker-url.workers.dev/now-playing
- https://your-worker-url.workers.dev/recent-tracks

## Troubleshooting

### "Configuration Error" SVG
- Check that `.dev.vars` exists and has `LASTFM_API_KEY`
- Check that `wrangler.toml` has `LASTFM_USERNAME`

### No tracks showing
- Verify your Last.fm username is correct
- Make sure your Last.fm profile is public
- Check you have recent scrobbles

### API Key Invalid
- Get a new one at https://www.last.fm/api/account/create
- Make sure you copied the full key without spaces

## File Structure

```
lastfm-worker/
├── .dev.vars              ← Your API key (local)
├── .dev.vars.example      ← Template
├── wrangler.toml          ← Your username + config
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           ← Routes
    ├── lastfm.ts          ← API client
    └── svg/
        ├── now-playing.ts
        └── recent-tracks.ts
```
