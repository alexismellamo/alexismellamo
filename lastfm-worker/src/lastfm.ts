type LastFmImage = {
  '#text': string;
  size: 'small' | 'medium' | 'large' | 'extralarge';
};

type LastFmTrack = {
  name: string;
  artist: {
    '#text': string;
    mbid?: string;
  };
  album: {
    '#text': string;
    mbid?: string;
  };
  image: LastFmImage[];
  url: string;
  '@attr'?: {
    nowplaying: 'true';
  };
  date?: {
    uts: string;
    '#text': string;
  };
};

type LastFmRecentTracksResponse = {
  recenttracks: {
    track: LastFmTrack[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
};

export type Track = {
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  url: string;
  nowPlaying: boolean;
  timestamp?: number;
};

export async function getRecentTracks(
  apiKey: string,
  username: string,
  limit: number = 10
): Promise<Track[]> {
  const url = new URL('https://ws.audioscrobbler.com/2.0/');
  url.searchParams.set('method', 'user.getrecenttracks');
  url.searchParams.set('user', username);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Last.fm API error: ${response.status}`);
  }

  const data = await response.json() as LastFmRecentTracksResponse;
  
  if (!data.recenttracks?.track) {
    return [];
  }

  const tracks = Array.isArray(data.recenttracks.track)
    ? data.recenttracks.track
    : [data.recenttracks.track];

  return tracks.map((track) => ({
    name: track.name,
    artist: track.artist['#text'],
    album: track.album['#text'],
    imageUrl: track.image.find((img) => img.size === 'extralarge')?.['#text'] || 
              track.image.find((img) => img.size === 'large')?.['#text'] || '',
    url: track.url,
    nowPlaying: track['@attr']?.nowplaying === 'true',
    timestamp: track.date ? parseInt(track.date.uts) * 1000 : undefined,
  }));
}

export async function imageToBase64(imageUrl: string): Promise<string> {
  if (!imageUrl) {
    return '';
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return '';
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    const base64 = btoa(binary);
    const contentType = response.headers.get('content-type') || 'image/png';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Image fetch error:', error);
    return '';
  }
}
