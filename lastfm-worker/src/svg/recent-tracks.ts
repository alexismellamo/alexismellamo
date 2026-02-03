import type { Track } from '../lastfm';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 1) + '…';
}

function formatTimeAgo(timestamp: number | undefined): string {
  if (!timestamp) {
    return 'Recently';
  }

  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${days}d ago`;
}

export function generateRecentTracksSvg(tracks: Track[], trackImages: string[]): string {
  const width = 500;
  const headerHeight = 50;
  const trackHeight = 70;
  const totalTracks = Math.min(tracks.length, 10);
  const height = headerHeight + trackHeight * totalTracks + 20;
  
  const backgroundColor = '#191414';
  const textColor = '#FFFFFF';
  const subTextColor = '#B3B3B3';
  const dividerColor = '#282828';
  const accentColor = '#1DB954';
  const albumSize = 50;

  if (tracks.length === 0) {
    return `
      <svg width="${width}" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="150" fill="${backgroundColor}" rx="8"/>
        <text x="250" y="75" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle">
          No recent tracks found
        </text>
      </svg>
    `.trim();
  }

  const trackElements = tracks.slice(0, 10).map((track, index) => {
    const y = headerHeight + trackHeight * index;
    const trackName = escapeXml(truncateText(track.name, 30));
    const artistName = escapeXml(truncateText(track.artist, 30));
    const timeAgo = formatTimeAgo(track.timestamp);
    const imageData = trackImages[index] || '';

    const albumArt = imageData
      ? `<image x="15" y="${y + 10}" width="${albumSize}" height="${albumSize}" href="${imageData}" clip-path="url(#clip${index})"/>`
      : `<rect x="15" y="${y + 10}" width="${albumSize}" height="${albumSize}" fill="#282828" rx="4"/>`;

    const nowPlayingIndicator = track.nowPlaying
      ? `<circle cx="${width - 25}" cy="${y + 20}" r="4" fill="${accentColor}">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
         </circle>`
      : '';

    return `
      <defs>
        <clipPath id="clip${index}">
          <rect x="15" y="${y + 10}" width="${albumSize}" height="${albumSize}" rx="4"/>
        </clipPath>
      </defs>
      <g>
        ${index > 0 ? `<line x1="15" y1="${y}" x2="${width - 15}" y2="${y}" stroke="${dividerColor}" stroke-width="1"/>` : ''}
        
        ${albumArt}
        ${nowPlayingIndicator}
        
        <text x="${15 + albumSize + 15}" y="${y + 30}" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${textColor}">
          ${trackName}
        </text>
        
        <text x="${15 + albumSize + 15}" y="${y + 48}" font-family="Arial, sans-serif" font-size="12" fill="${subTextColor}">
          ${artistName}
        </text>
        
        <text x="${width - 15}" y="${y + 40}" font-family="Arial, sans-serif" font-size="11" fill="${subTextColor}" text-anchor="end">
          ${track.nowPlaying ? 'Now' : timeAgo}
        </text>
      </g>
    `;
  }).join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>
      
      <text x="15" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${textColor}">
        Recent Tracks
      </text>
      
      ${trackElements}
    </svg>
  `.trim();
}
