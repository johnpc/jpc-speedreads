import { defineStorage } from "@aws-amplify/backend";
import { epubToText, listEpubs } from "../function/resource";

export const storage = defineStorage({
  name: "jpcSpeedReadStorage",
  access: (allow) => ({
    "epubs/*": [
      allow.authenticated.to(["read", "write"]),
      allow.resource(epubToText).to(["read", "write"]),
      allow.resource(listEpubs).to(["read", "write"]),
    ],
  }),
});
