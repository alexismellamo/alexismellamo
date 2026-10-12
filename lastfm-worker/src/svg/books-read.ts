import type { Book } from '../hardcover';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const COVER_WIDTH = 70;
export const COVER_HEIGHT = 105;

function finishedMonth(book: Book): string {
  const month = Number(book.finishedAt?.slice(5, 7));
  return MONTHS[month - 1] || '';
}

export function generateBooksReadSvg(books: Book[], coverImages: string[], year: number): string {
  const width = 500;
  const padding = 15;
  const gap = 10;
  const columns = 6;
  const headerHeight = 50;
  const labelHeight = 26;
  const rowHeight = COVER_HEIGHT + labelHeight;
  const rows = Math.max(1, Math.ceil(books.length / columns));
  const height = headerHeight + rows * rowHeight + 10;

  const backgroundColor = '#191414';
  const textColor = '#FFFFFF';
  const subTextColor = '#B3B3B3';
  const placeholderColor = '#282828';

  const countLabel = books.length === 1 ? '1 book' : `${books.length} books`;

  const covers = books.map((book, index) => {
    const x = padding + (index % columns) * (COVER_WIDTH + gap);
    const y = headerHeight + Math.floor(index / columns) * rowHeight;
    const imageData = coverImages[index] || '';

    const cover = imageData
      ? `<image x="${x}" y="${y}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" href="${imageData}" preserveAspectRatio="xMidYMid slice" clip-path="url(#cover${index})"/>`
      : `<rect x="${x}" y="${y}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="${placeholderColor}" rx="4"/>`;

    return `
      <defs>
        <clipPath id="cover${index}">
          <rect x="${x}" y="${y}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" rx="4"/>
        </clipPath>
      </defs>
      ${cover}
      <text x="${x + COVER_WIDTH / 2}" y="${y + COVER_HEIGHT + 16}" font-family="Arial, sans-serif" font-size="11" fill="${subTextColor}" text-anchor="middle">
        ${finishedMonth(book)}
      </text>
    `;
  }).join('');

  const emptyState = books.length === 0
    ? `<text x="250" y="${headerHeight + 50}" font-family="Arial, sans-serif" font-size="14" fill="${subTextColor}" text-anchor="middle">No books finished yet</text>`
    : '';

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>

      <text x="${padding}" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${textColor}">
        Read in ${year}
      </text>

      <text x="${width - padding}" y="30" font-family="Arial, sans-serif" font-size="12" fill="${subTextColor}" text-anchor="end">
        ${countLabel}
      </text>

      ${covers}
      ${emptyState}
    </svg>
  `.trim();
}
