Mneme Feast
===========

Named for the{" "} [Greek Muse for memory](https://en.wikipedia.org/wiki/Mneme) , Mneme Feast will be a web application and API for submitting, storing, and retrieving learning materials in a database. These learning materials can be sources of information, such as articles, news reports, official documents, scientific papers, specifications, etc; notes to condense and clarify the information in those sources; and questions or prompts to challenge a student to recall and use the information.

This project is open source. Contributors are welcome to [view the source code on GitHub](https://github.com/joewrotehaikus/mnemefeast), make their own GitHub fork, and submit pull requests for contribution to the project.

For discussion about the application, [go to our Discord server](https://discord.gg/PcsjqPFh).

This application is using NextJS 13 and Mongoose.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## The API

This application serves both the website and the API. There are currently three endpoints for the API. For your personal system, you will need the URI of a MongoDB database, possibly by running a local instance of MongoDB. The file "sample.env" has instructions for adding the URI that you are using.