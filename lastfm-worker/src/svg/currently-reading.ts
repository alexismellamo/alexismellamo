import type { Book } from '../hardcover';

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

function progressLabel(book: Book): string {
  if (book.progressPages && book.pages) {
    return `${book.progress}% · page ${book.progressPages} of ${book.pages}`;
  }
  return `${book.progress}%`;
}

export function generateCurrentlyReadingSvg(book: Book | null, coverImage: string): string {
  const width = 500;
  const height = 150;
  const backgroundColor = '#191414';
  const textColor = '#FFFFFF';
  const subTextColor = '#B3B3B3';
  const trackColor = '#282828';
  const accentColor = '#A78BFA';

  if (!book) {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>
        <text x="250" y="75" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle">
          Not reading anything right now
        </text>
      </svg>
    `.trim();
  }

  const coverWidth = 80;
  const coverHeight = 120;
  const padding = 15;
  const textStartX = padding + coverWidth + 20;
  const barWidth = width - textStartX - padding;
  const filled = Math.max(4, Math.round((barWidth * Math.min(book.progress, 100)) / 100));

  const title = escapeXml(truncateText(book.title, 34));
  const author = escapeXml(truncateText(book.author, 40));

  const coverElement = coverImage
    ? `<image x="${padding}" y="${padding}" width="${coverWidth}" height="${coverHeight}" href="${coverImage}" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)"/>`
    : `<rect x="${padding}" y="${padding}" width="${coverWidth}" height="${coverHeight}" fill="${trackColor}" rx="4"/>`;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="coverClip">
          <rect x="${padding}" y="${padding}" width="${coverWidth}" height="${coverHeight}" rx="4"/>
        </clipPath>
      </defs>

      <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>

      ${coverElement}

      <text x="${textStartX}" y="32" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${accentColor}">
        CURRENTLY READING
      </text>

      <text x="${textStartX}" y="62" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${textColor}">
        ${title}
      </text>

      <text x="${textStartX}" y="85" font-family="Arial, sans-serif" font-size="14" fill="${subTextColor}">
        ${author}
      </text>

      <rect x="${textStartX}" y="106" width="${barWidth}" height="6" fill="${trackColor}" rx="3"/>
      <rect x="${textStartX}" y="106" width="${filled}" height="6" fill="${accentColor}" rx="3"/>

      <text x="${textStartX}" y="128" font-family="Arial, sans-serif" font-size="11" fill="${subTextColor}">
        ${escapeXml(progressLabel(book))}
      </text>
    </svg>
  `.trim();
}
