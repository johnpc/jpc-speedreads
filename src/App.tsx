import { useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import SelectChapter from "./components/SelectChapter";
import SelectEpub from "./components/SelectEpub";
import { ChapterObject } from "./utils/types";
import Reader from "./components/Reader";
import { defaultDarkModeOverride, ThemeProvider } from "@aws-amplify/ui-react";
function App() {
  const theme = {
    name: "my-theme",
    overrides: [defaultDarkModeOverride],
  };

  const [epubFileName, setEpubFileName] = useState<string | undefined>(
    localStorage.getItem("epubFileName")
      ? localStorage.getItem("epubFileName")!
      : undefined
  );

  const epubToTextCacheKey = `${epubFileName}-fulltext`;
  const chapterCacheKey = `${epubFileName}-chapter`;
  const cachedChapterObject = localStorage.getItem(chapterCacheKey)
    ? JSON.parse(localStorage.getItem(chapterCacheKey)!)
    : undefined;

  const [chapter, setChapter] = useState<ChapterObject | undefined>(
    cachedChapterObject
  );
  const handleSetEpubFileName = (fileName: string | undefined) => {
    localStorage.setItem("epubFileName", fileName ?? "");
    setEpubFileName(fileName);
  };

  const handleSetChapter = (chapterObject: ChapterObject | undefined) => {
    localStorage.setItem(
      chapterCacheKey,
      chapterObject ? JSON.stringify(chapterObject) : ""
    );
    setChapter(chapterObject);
  };

  const handleSetNextChapter = () => {
    const epubToTextCache = localStorage.getItem(epubToTextCacheKey)
      ? JSON.parse(localStorage.getItem(epubToTextCacheKey)!)
      : undefined;
    if (epubToTextCache) {
      const currentChapterIndex = epubToTextCache.chapters.findIndex(
        (j: ChapterObject) => j.meta.title === chapter?.meta.title
      );
      const nextChapter = epubToTextCache.chapters[currentChapterIndex + 1];
      handleSetChapter(nextChapter);
    }
  };

  return (
    <ThemeProvider theme={theme} colorMode={"dark"}>
      <>
        {!epubFileName && !chapter ? (
          <SelectEpub setEpubFileName={handleSetEpubFileName} />
        ) : null}
        {epubFileName && !chapter ? (
          <SelectChapter
            setChapter={handleSetChapter}
            unsetEpubFileName={() => handleSetEpubFileName(undefined)}
            epubFileName={epubFileName}
          />
        ) : null}
        {epubFileName && chapter ? (
          <Reader
            chapter={chapter}
            epubFileName={epubFileName}
            unsetEpubFileName={() => handleSetEpubFileName(undefined)}
            unsetChapter={() => handleSetChapter(undefined)}
            setNextChapter={handleSetNextChapter}
          />
        ) : null}
      </>
    </ThemeProvider>
  );
}

export default App;
