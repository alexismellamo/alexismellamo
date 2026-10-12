import { mkdir, writeFile } from 'node:fs/promises';
import { coverToBase64, getBooks } from '../src/hardcover';
import { COVER_HEIGHT, COVER_WIDTH, generateBooksReadSvg } from '../src/svg/books-read';
import { generateCurrentlyReadingSvg } from '../src/svg/currently-reading';

const token = process.env.HARDCOVER_TOKEN;
if (!token) {
  throw new Error('HARDCOVER_TOKEN not set');
}

const outDir = process.argv[2] || '../books';
const year = new Date().getFullYear();
const { reading, read } = await getBooks(token, year);

const current = reading[0] || null;
const currentCover = current ? await coverToBase64(current.imageUrl, 80, 120) : '';
const readCovers = await Promise.all(
  read.map((book) => coverToBase64(book.imageUrl, COVER_WIDTH, COVER_HEIGHT))
);

await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/currently-reading.svg`, generateCurrentlyReadingSvg(current, currentCover));
await writeFile(`${outDir}/books-read.svg`, generateBooksReadSvg(read, readCovers, year));

console.log(`Rendered ${current ? current.title : 'nothing'} and ${read.length} books read in ${year}`);
