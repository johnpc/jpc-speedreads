import { useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import SelectChapter from "./components/SelectChapter";
import SelectEpub from "./components/SelectEpub";
import { ChapterObject } from "./utils/types";
import Reader from "./components/Reader";
function App() {
  const [epubFileName, setEpubFileName] = useState<string | undefined>(
    localStorage.getItem("epubFileName")
      ? localStorage.getItem("epubFileName")!
      : undefined
  );

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

  return (
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
        />
      ) : null}
    </>
  );
}

export default App;
