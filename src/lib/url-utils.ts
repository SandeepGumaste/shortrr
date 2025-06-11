import { nanoid } from 'nanoid';

export const generateShortId = () => nanoid(8);

export const getShortUrlFromId = (shortId: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/${shortId}`;
};
