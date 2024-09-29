import type { Schema } from "../data/resource";
import fs from "fs";
import EPub from "epub";
import { htmlToText } from "html-to-text";
import path from "path";
import htmlParser from "node-html-parser";
import { env } from "$amplify/env/epubToText";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
export const getEpubFromS3 = async (epubFileName: string): Promise<string> => {
  const key = epubFileName; // MUST be path prefixed with epubs/
  console.log({
    Bucket: env.JPC_SPEED_READ_STORAGE_BUCKET_NAME,
    Key: key,
  });
  const client = new S3Client({ region: env.AWS_REGION });
  const command = new GetObjectCommand({
    Bucket: env.JPC_SPEED_READ_STORAGE_BUCKET_NAME,
    Key: key,
  });
  const response = await client.send(command);
  if (!response.Body) {
    throw new Error(`Object with key ${key} not found`);
  }

  const stringResponse = Buffer.from(
    await response.Body.transformToByteArray()
  );
  const tempPath = path.join("/tmp", epubFileName.split("/").join("-"));
  console.log({ tempPath });
  // fs.mkdirSync(tempPath, { recursive: true });
  fs.writeFileSync(tempPath, stringResponse);
  // console.log({ stringResponse });
  // return stringResponse
  return tempPath;
};
type Meta = {
  id: string;
  excerpt: string;
  size: number;
  sequence_number: number;
  title: string;
};
type ChapterObject = {
  err: Error;
  chapterText: string;
  sequenceNumber: number;
  meta: Meta;
};
class EPUBToText {
  /**
   * EpubToText#extract()
   *
   * Opens the EPUB in sourceFile, extracts all chapters
   * and calls a callback function with the chapter content.
   * Callback parameters are (err, chapterText, sequenceNumber).
   *
   * An optional callback function can also be called initially,
   * at the beginning of the extraction.
   * Callback parameters are (err, numberOfChapters)
   **/
  extract(
    sourceFile: string,
    callback: (objs: Promise<ChapterObject>[]) => void,
    initialCallback?: (err: Error | null, numberOfChapters: number) => void
  ) {
    const epub = new EPub(sourceFile);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const klass = this;

    // callback fired for each chapter (or they are written to disk)
    epub.on("end", function () {
      const objs: Promise<ChapterObject>[] = epub.flow.map(function (
        chapter,
        sequence
      ) {
        return new Promise((resolve) => {
          epub.getChapter(chapter.id, function (err, html) {
            let txt = "";
            if (html) {
              txt = htmlToText(html.toString());
            }
            const meta: Meta = {
              id: chapter.id,
              excerpt: txt.trim().slice(0, 250),
              size: txt.length,
              sequence_number: sequence,
              title: chapter.title || klass.getTitleFromHtml(html),
            };
            resolve({ err, chapterText: txt, sequenceNumber: sequence, meta });
          });
        });
      });
      callback(objs);
    });

    // callback as soon as file is ready to give info on how many chapters will be processed
    epub.on("end", function () {
      if (initialCallback) {
        initialCallback(null, epub.flow.length);
      }
    });

    epub.parse();
  }

  /**
   * EpubToText#getTitleFromHtml()
   *
   * Best efforts to find a title in the HTML tags (title, H1, etc.)
   **/
  getTitleFromHtml(html: string) {
    const root = htmlParser.parse(html);
    let title = root.querySelector("h1");
    if (title == null) {
      title = root.querySelector("title");
      if (title == null) {
        return "";
      }
    }
    return title.structuredText.replace("\n", " ");
  }
}

export const handler: Schema["getEpubToText"]["functionHandler"] = async (
  props
) => {
  const epubFileName = props.arguments.epubFileName;
  console.log({ epubFileName });
  const tmpPath = await getEpubFromS3(epubFileName);
  const epubToText = new EPUBToText();
  const promise: Promise<Promise<ChapterObject>[]> = new Promise((resolve) => {
    epubToText.extract(
      tmpPath,
      (objs: Promise<ChapterObject>[]) => {
        resolve(objs);
      },
      (err, numberOfChapters) => {
        console.log({ err, numberOfChapters });
      }
    );
  });
  const epubResult = await promise;
  const allResults = await Promise.all(epubResult);
  console.log({ allResults });

  return {
    chapters: allResults,
  };
};
