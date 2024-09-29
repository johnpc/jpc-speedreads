import { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Heading,
  Loader,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { ChapterObject } from "../utils/types";
import { ArrowBack } from "@mui/icons-material";
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
        <Heading color={tokens.colors.overlay[30]}>Downloading book (this could take a while)</Heading>
        <Loader variation="linear" />
      </>
    );
  return (
    <>
      <Button
              colorTheme="overlay"

        display={"block"}
        margin={tokens.space.xs}
        variation="link"
        onClick={props.unsetEpubFileName}
      >
        <ArrowBack />
      </Button>
      <Text marginBottom={tokens.space.xs} color={tokens.colors.overlay[30]}>
        {props.epubFileName}
      </Text>
      <Heading color={tokens.colors.overlay[70]} marginBottom={tokens.space.xs} level={5}>
        Chapters
      </Heading>
      {chapters.map((chapter) => (
        <Button
        colorTheme="overlay"
        color={tokens.colors.overlay[50]}
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
    </>
  );
}
