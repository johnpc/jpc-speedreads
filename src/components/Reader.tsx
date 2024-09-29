import { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Heading,
  Loader,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { PlayArrow, PauseCircle } from "@mui/icons-material";
import { ChapterObject } from "../utils/types";

export default function Reader(props: {
  epubFileName: string;
  chapter: ChapterObject;
  unsetChapter: () => void;
  unsetEpubFileName: () => void;
}) {
  const { tokens } = useTheme();
  const [paused, setPaused] = useState(true);
  const wordIndexCacheKey = `${props.epubFileName}-${props.chapter.meta.title}-wordindex`;
  const [wordIndex, setWordIndex] = useState(
    localStorage.getItem(wordIndexCacheKey)
      ? parseInt(localStorage.getItem(wordIndexCacheKey)!)
      : 0
  );
  const [wordsPerSecond, setWordsPerSecond] = useState(
    localStorage.getItem("wordsPerSecond")
      ? parseInt(localStorage.getItem("wordsPerSecond")!)
      : 3
  );
  const text = props.chapter?.chapterText || "NO_CHAPTER_SELECTED";
  const allWords = text.replaceAll("\n", " ").replaceAll("  ", " ").split(" ");
  const length = allWords.length;
  console.log({ text, wordIndex, length });
  const duration = length / wordsPerSecond;
  const wordToShow = wordIndex >= length ? "Done." : allWords[wordIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      if (paused) return;
      setWordIndex(wordIndex + 1);
      localStorage.setItem(wordIndexCacheKey, wordIndex.toFixed());
      if (wordIndex >= length) setPaused(true);
    }, 1000 / wordsPerSecond);
    return () => clearInterval(interval);
  }, [wordIndex, length, wordsPerSecond, paused]);

  const handleResetToBeginningOfChapter = () => {
    const shouldReset = confirm(
      "Are you sure you want to reset to the beginning of the chapter?"
    );
    if (shouldReset) {
      setWordIndex(0);
    }
  };

  const handleSetWordsPerSecond = (wps: number) => {
    localStorage.setItem("wordsPerSecond", wps.toFixed());
    setWordsPerSecond(wps);
  };

  return (
    <>
      <Heading level={6} marginBottom={tokens.space.xl}>
        {props.epubFileName}: {props.chapter.meta.title}
      </Heading>
      <Heading level={1} margin={tokens.space.large}>
        {wordToShow}
      </Heading>
      <Button
        marginRight={tokens.space.small}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <PlayArrow /> : <PauseCircle />}
      </Button>
      <Divider
        marginTop={tokens.space.small}
        marginBottom={tokens.space.small}
        orientation="horizontal"
      />
      <Text>
        Length is {length} words. Read time is {(duration / 60).toFixed(1)}{" "}
        minutes. Time remaining is{" "}
        {((length - wordIndex) / wordsPerSecond / 60).toFixed(1)} minutes
      </Text>
      <Button
        margin={tokens.space.small}
        onClick={() => handleSetWordsPerSecond(wordsPerSecond - 1)}
      >
        Slower
      </Button>
      <Button
        margin={tokens.space.small}
        onClick={() => handleSetWordsPerSecond(wordsPerSecond + 1)}
      >
        Faster
      </Button>
      <Loader
        variation="linear"
        marginBottom={tokens.space.medium}
        percentage={Math.min(
          parseFloat(((wordIndex / length) * 100).toFixed(2)),
          100
        )}
        isDeterminate
      />
      <Text>
        Word {wordIndex} of {length}
      </Text>
      <Button
        marginTop={tokens.space.small}
        isFullWidth
        variation="warning"
        onClick={handleResetToBeginningOfChapter}
      >
        Reset To Beginning of Chapter
      </Button>
      <Divider marginTop={tokens.space.medium} orientation="horizontal" />
      <Button
        margin={tokens.space.xxxs}
        isFullWidth
        variation="destructive"
        onClick={props.unsetChapter}
      >
        Back to Chapter List
      </Button>
      <Button
        margin={tokens.space.xxxs}
        isFullWidth
        variation="destructive"
        onClick={() => {
          props.unsetChapter();
          props.unsetEpubFileName();
        }}
      >
        Switch Books
      </Button>
    </>
  );
}
