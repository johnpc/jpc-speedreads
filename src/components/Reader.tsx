import { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Heading,
  Loader,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import {
  PlayArrow,
  PauseCircle,
  FastForward,
  FastRewind,
  Undo,
  Redo,
  ArrowBack,
} from "@mui/icons-material";
import { ChapterObject } from "../utils/types";

export default function Reader(props: {
  epubFileName: string;
  chapter: ChapterObject;
  unsetChapter: () => void;
  setNextChapter: () => void;
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
  }, [wordIndex, length, wordsPerSecond, paused, wordIndexCacheKey, props]);

  const handleResetToBeginningOfChapter = () => {
    const shouldReset = confirm(
      "Are you sure you want to reset to the beginning of the chapter?"
    );
    if (shouldReset) {
      localStorage.setItem(wordIndexCacheKey, "0");
      setWordIndex(0);
    }
  };

  const handleSetWordsPerSecond = (wps: number) => {
    localStorage.setItem("wordsPerSecond", wps.toFixed());
    setWordsPerSecond(wps);
  };

  const handleSetWordIndex = (index: number) => {
    localStorage.setItem(wordIndexCacheKey, index.toFixed());
    if (index < 0) index = 0;
    setWordIndex(index);
  };

  return (
    <>
      <Button
      color={tokens.colors.overlay[70]}
        display={"block"}
        margin={tokens.space.xs}
        variation="link"
        colorTheme="overlay"
        onClick={props.unsetChapter}
      >
        <ArrowBack />
      </Button>
      <Text marginBottom={tokens.space.xs} color={tokens.colors.overlay[30]}>
        {" "}
        {props.epubFileName}: {props.chapter.meta.title}
      </Text>

      <Heading color={tokens.colors.overlay[80]} level={1} margin={tokens.space.large}>
        {wordToShow}
      </Heading>
      <Button

              color={tokens.colors.overlay[50]}

        colorTheme="overlay"
        marginRight={tokens.space.small}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <PlayArrow /> : <PauseCircle />}
      </Button>
      <Divider
        color={tokens.colors.overlay[30]}
        marginTop={tokens.space.small}
        marginBottom={tokens.space.small}
        orientation="horizontal"
      />
      <Text color={tokens.colors.overlay[30]}>
        Length is {length} words. Read time is {(duration / 60).toFixed(1)}{" "}
        minutes. Time remaining is{" "}
        {((length - wordIndex) / wordsPerSecond / 60).toFixed(1)} minutes
      </Text>
      <Heading color={tokens.colors.overlay[30]} marginBottom={tokens.space.small}>
        ({wordsPerSecond} words per second)
      </Heading>
      <Button
        colorTheme="overlay"
        color={tokens.colors.overlay[50]}
        margin={tokens.space.xxxs}
        onClick={() => handleSetWordIndex(wordIndex - 10)}
      >
        <Undo />
      </Button>
      <Button
        colorTheme="overlay"
        color={tokens.colors.overlay[50]}
        margin={tokens.space.xxxs}
        onClick={() => handleSetWordsPerSecond(wordsPerSecond - 1)}
      >
        <FastRewind />
      </Button>
      <Button
        colorTheme="overlay"
        color={tokens.colors.overlay[50]}
        margin={tokens.space.xxxs}
        onClick={() => handleSetWordsPerSecond(wordsPerSecond + 1)}
      >
        <FastForward />
      </Button>
      <Button
        colorTheme="overlay"
        color={tokens.colors.overlay[50]}
        margin={tokens.space.xxxs}
        onClick={() => handleSetWordIndex(wordIndex + 10)}
      >
        <Redo />
      </Button>
      <Loader
        filledColor={tokens.colors.overlay[30]}
        variation="linear"
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
        percentage={Math.min(
          parseFloat(((wordIndex / length) * 100).toFixed(2)),
          100
        )}
        isPercentageTextHidden
        isDeterminate
      />
      <Text color={tokens.colors.overlay[30]}>
        Word {wordIndex} of {length}
      </Text>
      <Button
        colorTheme="overlay"
        marginTop={tokens.space.xxxs}
        isFullWidth
        onClick={() => {
          props.setNextChapter();
          setWordIndex(0);
        }}
      >
        <Text color={tokens.colors.overlay[30]}>Next Chapter</Text>
      </Button>
      <Button
        colorTheme="overlay"
        marginTop={tokens.space.small}
        isFullWidth
        variation="warning"
        onClick={handleResetToBeginningOfChapter}
      >
        Reset To Beginning of Chapter
      </Button>
    </>
  );
}
