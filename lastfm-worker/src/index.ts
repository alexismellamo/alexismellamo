import { getRecentTracks, imageToBase64 } from './lastfm';
import { generateNowPlayingSvg } from './svg/now-playing';
import { generateRecentTracksSvg } from './svg/recent-tracks';

type Env = {
  LASTFM_API_KEY: string;
  LASTFM_USERNAME: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!env.LASTFM_API_KEY || !env.LASTFM_USERNAME) {
      return new Response(
        generateErrorSvg('Configuration Error', 'LASTFM_API_KEY or LASTFM_USERNAME not set'),
        {
          headers: {
            'Content-Type': 'image/svg+xml',
            ...corsHeaders,
          },
        }
      );
    }

    try {
      if (path === '/now-playing') {
        const tracks = await getRecentTracks(env.LASTFM_API_KEY, env.LASTFM_USERNAME, 1);
        const track = tracks.length > 0 ? tracks[0] : null;
        
        let base64Image = '';
        if (track?.imageUrl) {
          try {
            base64Image = await imageToBase64(track.imageUrl);
          } catch (e) {
            console.error('Failed to fetch album art:', e);
          }
        }

        const svg = generateNowPlayingSvg(track, base64Image);
        
        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=5',
            ...corsHeaders,
          },
        });
      }

      if (path === '/recent-tracks') {
        const tracks = await getRecentTracks(env.LASTFM_API_KEY, env.LASTFM_USERNAME, 10);
        
        const trackImages = await Promise.all(
          tracks.map(async (track) => {
            if (track.imageUrl) {
              try {
                return await imageToBase64(track.imageUrl);
              } catch (e) {
                console.error('Failed to fetch album art:', e);
                return '';
              }
            }
            return '';
          })
        );
        
        const svg = generateRecentTracksSvg(tracks, trackImages);
        
        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=5',
            ...corsHeaders,
          },
        });
      }

      if (path.startsWith('/image-proxy')) {
        const imageUrl = url.searchParams.get('url');
        if (!imageUrl) {
          return new Response('Missing url parameter', { status: 400 });
        }

        try {
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            return new Response('Failed to fetch image', { status: 404 });
          }

          return new Response(imageResponse.body, {
            headers: {
              'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=86400',
              ...corsHeaders,
            },
          });
        } catch {
          return new Response('Failed to fetch image', { status: 500 });
        }
      }

      if (path === '/debug') {
        const tracks = await getRecentTracks(env.LASTFM_API_KEY, env.LASTFM_USERNAME, 1);
        return new Response(JSON.stringify(tracks, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      return new Response(
        generateErrorSvg('Not Found', 'Available endpoints: /now-playing, /recent-tracks'),
        {
          status: 404,
          headers: {
            'Content-Type': 'image/svg+xml',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        generateErrorSvg('Error', errorMessage),
        {
          status: 500,
          headers: {
            'Content-Type': 'image/svg+xml',
            ...corsHeaders,
          },
        }
      );
    }
  },
};

function generateErrorSvg(title: string, message: string): string {
  const width = 500;
  const height = 150;
  const backgroundColor = '#191414';
  const textColor = '#FFFFFF';
  const errorColor = '#E22134';

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>
      <text x="250" y="60" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${errorColor}" text-anchor="middle">
        ${title}
      </text>
      <text x="250" y="90" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle">
        ${message}
      </text>
    </svg>
  `.trim();
}
