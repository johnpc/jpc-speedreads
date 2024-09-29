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
const client = generateClient<Schema>();

export default function SelectEpub(props: {
  setEpubFileName: (epubFileName: string) => void;
}) {
  const { tokens } = useTheme();
  const [epubFileNames, setEpubFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const setup = async () => {
      const response = await client.queries.listEpubs({ pathFilter: "epubs" });
      setEpubFileNames(
        response
          .data!.epubKeys!.filter((t) => t)
          .map((key: string | null) => key!)
      );
      setLoading(false);
    };
    setup();
  }, []);

  if (loading)
    return (
      <>
        <Heading>
          Searching for available books (this could take a while)
        </Heading>
        <Loader variation="linear" />
      </>
    );
  return (
    <>
      <Heading level={1}>Available Books</Heading>
      <Divider
        marginTop={tokens.space.small}
        marginBottom={tokens.space.small}
        orientation="horizontal"
      />
      {epubFileNames?.map((epubFileName) => (
        <Button
          margin={tokens.space.xxxs}
          size="large"
          isFullWidth
          key={epubFileName}
          onClick={() => props.setEpubFileName(epubFileName)}
        >
          {epubFileName}
        </Button>
      ))}
    </>
  );
}
