# Mneme

Mneme is a powerful learning platform designed to take your study and knowledge retention to the next level. Unlike traditional flashcard apps, Mneme offers a wide range of quiz question types, including fill-in-the-blank, unordered list matching, and even verbatim text memorization. What sets Mneme apart is its commitment to linking every quiz question to reliable sources, ensuring accuracy and credibility in your learning process. Additionally, Mneme allows you to create, store, and retrieve learning materials, making it a versatile tool for students, educators, and knowledge seekers.

Named after the [Greek Muse for memory](https://en.wikipedia.org/wiki/Mneme), Mneme is a web application and API that facilitates the submission, storage, and retrieval of learning materials in a comprehensive database. These learning materials encompass various categories, including articles, news reports, official documents, scientific papers, specifications, and more. Users can also create concise notes to distill and clarify information from these sources. Furthermore, Mneme empowers users to craft diverse quiz questions or prompts that challenge learners to recall and apply the information they've acquired.

## Open Source Collaboration

Mneme is an open-source project, inviting contributors to collaborate and enhance its capabilities. You can explore the project's source code on [GitHub](https://github.com/joewrotehaikus/mnemefeast), create your GitHub fork, and submit pull requests to contribute to its development. Join the community, share your ideas, and help shape the future of Mneme.

For discussions and community engagement, visit our [Discord server](https://discord.gg/PcsjqPFh).

## Getting Started

To set up Mneme from the Git repository, ensure you have Git and npm installed on your system. You'll also need to have your own MongoDB instance. If you don't have one, follow the MongoDB installation instructions [here](https://www.mongodb.com/docs/manual/administration/install-community/).

1. Clone the repository:
   ```bash
   git clone https://github.com/joewrotehaikus/mnemefeast.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   Open the `mneme/sample.env` file and follow the instructions to create your own `.env` file, including the URL to your MongoDB database.

4. Start the development server:
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) in your web browser to see Mneme in action.

## Fonts and Optimization

This project leverages [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) for automatic font optimization and loading of Inter, a custom Google Font.

## The API

Mneme serves both its website and API through the same application. Currently, there are three API endpoints. To set up the API for your use, you'll need the URI of a MongoDB database, which you can obtain by running a local MongoDB instance. Detailed instructions for configuring the URI are provided in the "sample.env" file.

## Roadmap

Mneme's development roadmap includes creating three endpoints for the API, each corresponding to three distinct Mongoose models. These models are essential for adding records to the database while adhering to defined schemas and input validation.

Proposed Models:
1. **Source**
   - Information and links to reliable sources of subject-related information for study.
2. **Note**
   - Concise summaries or explanations drawn from one or more sources, with notes supported by multiple sources considered more reliable.
3. **Quiz**
   - A versatile question or prompt that assesses a student's understanding of information. Various question formats are supported, such as prompt/response, fill-in-the-blank, ordered or unordered lists, coding exercises, and more. Prompts may include multimedia elements (audio, video, images) with text alternatives compliant with WCAG accessibility guidelines.

Join us on this exciting journey to transform learning and knowledge sharing with Mneme!

## Developers

### Contributing to Mneme

We welcome contributions from developers like you to make Mneme even better. To get started, follow these steps:

1. **Fork the Repository**

   Click the "Fork" button at the top right corner of the Mneme repository on GitHub. This will create a copy of the repository under your GitHub account.

2. **Clone Your Fork**

   Clone your forked repository to your local machine using the following command:

   ```bash
   git clone https://github.com/YourUsername/mnemefeast.git
   #Add the link of the forked repository from your github account
   ```

3. **Create a New Branch**

   Create a new branch for your changes using a descriptive branch name:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**

   Make your desired changes to the codebase.

5. **Commit Changes**

   Commit your changes with a clear and concise commit message:

   ```bash
   git commit -m "Add your descriptive commit message here"
   ```

6. **Push Changes**

   Push your changes to your forked repository on GitHub:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**

   Visit the Mneme repository on GitHub and click the "New Pull Request" button. Compare your branch with the main branch of the Mneme repository. Provide a detailed description of your changes in the pull request.

8. **Review and Merge**

   After your pull request is reviewed and approved, it will be merged into the main Mneme repository.

Thank you for contributing to Mneme! Together, we can make learning more efficient and enjoyable for everyone.
