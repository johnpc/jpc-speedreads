export type Meta = {
  id: string;
  excerpt: string;
  size: number;
  sequence_number: number;
  title: string;
};

export type ChapterObject = {
  err: Error;
  chapterText: string;
  sequenceNumber: number;
  meta: Meta;
};
