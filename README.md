# speedread.jpc.io

A dead-simple app for speed reading .epub books.

The app is available live at [https://speedread.jpc.io](https://speedread.jpc.io).

## Setup

Clone the repo, install dependencies, deploy backend resources:

```bash
git clone git@github.com:johnpc/jpc-speedreads.git
cd jpc-speedreads
npm install
npx ampx sandbox
```

Then, to run the frontend app

```bash
npm run dev
```

## Deploying

Deploy this application to your own AWS account in one click:

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/jpc-speedreads)
