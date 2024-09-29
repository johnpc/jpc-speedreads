import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { epubToText, listEpubs } from "../function/resource";

const schema = a
  .schema({
    EpubKeys: a.customType({
      epubKeys: a.string().array(),
    }),
    ChapterObjects: a.customType({
      chapters: a.ref("ChapterObjectType").array(),
    }),
    MetaType: a.customType({
      id: a.string(),
      excerpt: a.string(),
      size: a.integer(),
      sequence_number: a.integer(),
      title: a.string(),
    }),
    ChapterObjectType: a.customType({
      chapterText: a.string(),
      sequenceNumber: a.integer(),
      meta: a.ref("MetaType"),
    }),
    StringType: a.customType({
      value: a.string(),
    }),
    getEpubToText: a
      .query()
      .arguments({ epubFileName: a.string().required() })
      .returns(a.ref("ChapterObjects"))
      .handler(a.handler.function(epubToText))
      .authorization((allow) => allow.guest()),

    listEpubs: a
      .query()
      .arguments({ pathFilter: a.string() })
      .returns(a.ref("EpubKeys"))
      .handler(a.handler.function(listEpubs))
      .authorization((allow) => allow.guest()),
  })
  .authorization((allow) => [
    allow.resource(epubToText),
    allow.resource(listEpubs),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
