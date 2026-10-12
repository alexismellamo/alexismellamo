import { imageToBase64 } from './lastfm';

type HardcoverRead = {
  started_at: string | null;
  finished_at: string | null;
  progress: number | null;
  progress_pages: number | null;
};

type HardcoverUserBook = {
  status_id: number;
  book: {
    title: string;
    slug: string;
    pages: number | null;
    image: { url: string } | null;
    contributions: { author: { name: string } | null }[];
  };
  user_book_reads: HardcoverRead[];
};

type HardcoverResponse = {
  data?: { me: { user_books: HardcoverUserBook[] }[] };
  errors?: { message: string }[];
};

export type Book = {
  title: string;
  author: string;
  imageUrl: string;
  url: string;
  pages: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  progress: number;
  progressPages: number | null;
};

const READING = 2;
const READ = 3;

const QUERY = `query {
  me {
    user_books(where: { status_id: { _in: [${READING}, ${READ}] } }) {
      status_id
      book {
        title
        slug
        pages
        image { url }
        contributions(limit: 1) { author { name } }
      }
      user_book_reads(order_by: { id: desc }, limit: 1) {
        started_at
        finished_at
        progress
        progress_pages
      }
    }
  }
}`;

function toBook(userBook: HardcoverUserBook): Book {
  const read = userBook.user_book_reads[0];
  return {
    title: userBook.book.title,
    author: userBook.book.contributions[0]?.author?.name || '',
    imageUrl: userBook.book.image?.url || '',
    url: `https://hardcover.app/books/${userBook.book.slug}`,
    pages: userBook.book.pages,
    startedAt: read?.started_at || null,
    finishedAt: read?.finished_at || null,
    progress: Math.round(read?.progress || 0),
    progressPages: read?.progress_pages || null,
  };
}

async function getUserBooks(token: string): Promise<HardcoverUserBook[]> {
  const response = await fetch('https://api.hardcover.app/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      'User-Agent': 'alexismellamo-github-profile',
    },
    body: JSON.stringify({ query: QUERY }),
  });

  if (!response.ok) {
    throw new Error(`Hardcover API error: ${response.status}`);
  }

  const data = await response.json() as HardcoverResponse;
  if (data.errors?.length) {
    throw new Error(`Hardcover API error: ${data.errors[0].message}`);
  }

  return data.data?.me[0]?.user_books || [];
}

export async function getBooks(token: string, year: number): Promise<{ reading: Book[]; read: Book[] }> {
  const userBooks = await getUserBooks(token);
  const yearPrefix = `${year}-`;

  const reading = userBooks
    .filter((userBook) => userBook.status_id === READING)
    .map(toBook)
    .sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''));

  const read = userBooks
    .filter((userBook) => userBook.status_id === READ)
    .map(toBook)
    .filter((book) => book.finishedAt?.startsWith(yearPrefix))
    .sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || ''));

  return { reading, read };
}

export async function coverToBase64(imageUrl: string, width: number, height: number): Promise<string> {
  if (!imageUrl) {
    return '';
  }

  const resized = new URL('https://images.weserv.nl/');
  resized.searchParams.set('url', imageUrl);
  resized.searchParams.set('w', String(width * 2));
  resized.searchParams.set('h', String(height * 2));
  resized.searchParams.set('fit', 'cover');
  resized.searchParams.set('output', 'jpg');
  resized.searchParams.set('q', '70');

  return (await imageToBase64(resized.toString())) || imageToBase64(imageUrl);
}
