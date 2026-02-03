# Last.fm GitHub Profile Worker

A Cloudflare Worker that generates dynamic SVG images showing your Last.fm listening activity for your GitHub profile.

## Features

- **Now Playing**: Shows the currently playing track with animated indicator
- **Recent Tracks**: Displays your last 10 scrobbles
- **Spotify-style Design**: Dark theme with album artwork
- **Real-time Updates**: Cached for 60 seconds for optimal performance

## Setup

### 1. Get Your Last.fm API Key

1. Go to https://www.last.fm/api/account/create
2. Fill in the form (callback URL can be anything for this use case)
3. Copy your API Key

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

#### For Local Development

1. Edit `.dev.vars` and add your API key:
   ```
   LASTFM_API_KEY=your-actual-api-key-here
   ```

2. Edit `wrangler.toml` and set your Last.fm username:
   ```toml
   [vars]
   LASTFM_USERNAME = "your-lastfm-username"
   ```

#### For Production (After First Deploy)

After you deploy for the first time, add your API key as a secret:

```bash
npx wrangler secret put LASTFM_API_KEY
```

When prompted, paste your actual Last.fm API key.

### 4. Test Locally

```bash
npm run dev
```

Open your browser and visit:
- http://localhost:8787/now-playing
- http://localhost:8787/recent-tracks

You should see SVG images with your Last.fm data!

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

After deployment, you'll get a URL like:
`https://lastfm-github-profile.your-username.workers.dev`

**Important**: Remember to set the production secret after first deploy:
```bash
npx wrangler secret put LASTFM_API_KEY
```

### 6. Update Your GitHub Profile

Add these to your GitHub profile README:

```markdown
## 🎧 Now Playing

<img src="https://lastfm-github-profile.your-username.workers.dev/now-playing" width="500" alt="Now Playing" />

## 📻 Recent Tracks

<img src="https://lastfm-github-profile.your-username.workers.dev/recent-tracks" width="500" alt="Recent Tracks" />
```

Replace `your-username` with your actual Cloudflare Workers subdomain.

## Endpoints

- `/now-playing` - Shows current or last played track with album art
- `/recent-tracks` - Lists your last 10 scrobbles

## Configuration

### Cache Duration

Images are cached for 60 seconds by default. To adjust, modify the `Cache-Control` header in `src/index.ts`:

```typescript
'Cache-Control': 'public, max-age=60'
```

### Styling

All styling can be customized in:
- `src/svg/now-playing.ts` - Now playing card design
- `src/svg/recent-tracks.ts` - Recent tracks list design

Colors and layout are defined as constants at the top of each file.
