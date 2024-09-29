import { defineFunction } from "@aws-amplify/backend";

export const epubToText = defineFunction({
  name: "epubToText",
  entry: "./epubToText.ts",
  timeoutSeconds: 600,
});

export const listEpubs = defineFunction({
  name: "listEpubs",
  entry: "./listEpubs.ts",
});
