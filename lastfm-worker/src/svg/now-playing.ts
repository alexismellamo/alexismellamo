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

export function generateNowPlayingSvg(track: Track | null, imageUrl: string): string {
  const width = 500;
  const height = 150;
  const backgroundColor = '#191414';
  const textColor = '#FFFFFF';
  const subTextColor = '#B3B3B3';
  const accentColor = '#1DB954';

  if (!track) {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>
        <text x="250" y="75" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle">
          No recent tracks found
        </text>
      </svg>
    `.trim();
  }

  const trackName = escapeXml(truncateText(track.name, 40));
  const artistName = escapeXml(truncateText(track.artist, 40));
  const albumName = escapeXml(truncateText(track.album, 40));

  const imageSize = 120;
  const imagePadding = 15;
  const textStartX = imagePadding + imageSize + 20;

  const nowPlayingIndicator = track.nowPlaying
    ? `
      <g transform="translate(${textStartX}, 25)">
        <circle cx="0" cy="0" r="3" fill="${accentColor}"/>
        <rect x="8" y="-8" width="3" height="16" fill="${accentColor}">
          <animate attributeName="height" values="8;16;8" dur="0.8s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-4;-8;-4" dur="0.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="14" y="-6" width="3" height="12" fill="${accentColor}">
          <animate attributeName="height" values="6;12;6" dur="0.6s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-3;-6;-3" dur="0.6s" repeatCount="indefinite"/>
        </rect>
        <rect x="20" y="-10" width="3" height="20" fill="${accentColor}">
          <animate attributeName="height" values="10;20;10" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-5;-10;-5" dur="1s" repeatCount="indefinite"/>
        </rect>
        <text x="30" y="5" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${accentColor}">
          NOW PLAYING
        </text>
      </g>
    `
    : `
      <text x="${textStartX}" y="30" font-family="Arial, sans-serif" font-size="12" fill="${subTextColor}">
        Last played
      </text>
    `;

  const imageElement = imageUrl
    ? `<image x="${imagePadding}" y="${imagePadding}" width="${imageSize}" height="${imageSize}" href="${imageUrl}" clip-path="url(#albumClip)"/>`
    : `<rect x="${imagePadding}" y="${imagePadding}" width="${imageSize}" height="${imageSize}" fill="#282828" rx="4"/>`;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="albumClip">
          <rect x="${imagePadding}" y="${imagePadding}" width="${imageSize}" height="${imageSize}" rx="4"/>
        </clipPath>
      </defs>
      
      <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>
      
      ${imageElement}
      
      ${nowPlayingIndicator}
      
      <text x="${textStartX}" y="${track.nowPlaying ? 60 : 55}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${textColor}">
        ${trackName}
      </text>
      
      <text x="${textStartX}" y="${track.nowPlaying ? 85 : 80}" font-family="Arial, sans-serif" font-size="14" fill="${subTextColor}">
        ${artistName}
      </text>
      
      <text x="${textStartX}" y="${track.nowPlaying ? 105 : 100}" font-family="Arial, sans-serif" font-size="12" fill="${subTextColor}">
        ${albumName}
      </text>
    </svg>
  `.trim();
}
