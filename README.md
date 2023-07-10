Mneme Feast
===========

Named for the [Greek Muse for memory](https://en.wikipedia.org/wiki/Mneme) , Mneme Feast will be a web application and API for submitting, storing, and retrieving learning materials in a database. These learning materials can be sources of information, such as articles, news reports, official documents, scientific papers, specifications, etc; notes to condense and clarify the information in those sources; and questions or prompts to challenge a student to recall and use the information.

This project is open source. Contributors are welcome to [view the source code on GitHub](https://github.com/joewrotehaikus/mnemefeast), make their own GitHub fork, and submit pull requests for contribution to the project.

For discussion about the application, [go to our Discord server](https://discord.gg/PcsjqPFh).

This application is using NextJS 13 and Mongoose, bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## To Set Up From Git Repository

You are required to have git and npm installed. You will have to provide your own instance of MongoDB. [For instructions on getting your own MongoDB instance, click here](https://www.mongodb.com/docs/manual/administration/install-community/).

In command terminal, type:
```bash
git clone https://github.com/joewrotehaikus/mnemefeast.git
```
Then
```
npm install
```

Once that installs, you will open mneme/sample.env and follow the instructions to create your own .env file, with the URL to your MongoDB database.

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

## Where We Are Going

The plan is to make three endpoints for the API, each corresponding to three Mongoose models. The models are there to assist in adding records to the database using a schema and validating the input before adding.

Here are the proposed models:
1. Source
    > Information and link to a reliable source of information pertinent to a subject one might one to study
2. Note
    > A brief summary or explanation of information one might wish to study and learn drawn from one or more sources (the more sources that support a note, the more reliable the note likely is)
3. Quiz
    > A single question or prompt that checks a student's command of information. This can come in many forms, such as prompt/response, fill-in-the-blank, ordered or unordered list to fill in, sandbox for coding, etc. The prompt may be multimedia, audio, video, still image, or text, so long as there are text alternatives compliant with WCAG.