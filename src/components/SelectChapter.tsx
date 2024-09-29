import { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Heading,
  Loader,
  useTheme,
} from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { ChapterObject } from "../utils/types";
const client = generateClient<Schema>();

export default function SelectChapter(props: {
  epubFileName: string;
  setChapter: (chapter: ChapterObject) => void;
  unsetEpubFileName: () => void;
}) {
  const { tokens } = useTheme();
  const [chapters, setChapters] = useState<ChapterObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const setup = async () => {
      const epubToTextCacheKey = `${props.epubFileName}-fulltext`;
      const epubToTextCache = localStorage.getItem(epubToTextCacheKey)
        ? JSON.parse(localStorage.getItem(epubToTextCacheKey)!)
        : undefined;
      if (epubToTextCache) {
        setChapters(
          epubToTextCache.chapters.filter((j: ChapterObject) => j.meta.title)
        );
      } else {
        const epubText = await client.queries.getEpubToText({
          epubFileName: props.epubFileName,
        });
        console.log({ epubText });
        const filtered = epubText.data!.chapters!.filter((j) => j!.meta!.title);
        console.log({ filtered });
        localStorage.setItem(epubToTextCacheKey, JSON.stringify(epubText.data));
        setChapters(filtered as ChapterObject[]);
      }

      setLoading(false);
    };
    setup();
  }, [props.epubFileName]);

  if (loading)
    return (
      <>
        <Heading>Downloading book (this could take a while)</Heading>
        <Loader variation="linear" />
      </>
    );
  return (
    <>
      <Heading marginBottom={tokens.space.medium} level={5}>
        Chapters for {props.epubFileName}
      </Heading>
      {chapters.map((chapter) => (
        <Button
          margin={tokens.space.xxxs}
          size="large"
          isFullWidth
          key={chapter.sequenceNumber}
          onClick={() => props.setChapter(chapter)}
        >
          {chapter.meta.title}
        </Button>
      ))}
      <Divider
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
        orientation="horizontal"
      />
      <Button onClick={props.unsetEpubFileName}>Back</Button>
    </>
  );
}
