<!--
This markdown can be viewed as a mindmap using the MarkMap VS Code extension.

MarkMap can also export the mindmap into an HTML file that uses SVG to draw the mindmap
-->

# Enums

- ERole
  - user
  - admin
  - guest
- EQuizType
  - prompt-response
  - multiple-choice
  - fill-in-the-blank
  - ordered-list-answer
  - unordered-list-answer
  - verbatim
- EMediumType
  - website
  - book
  - audio
  - video
  - periodical

# Types

- TQuiz
  - quizId (ObjectId)
  - lastCorrect (Date)
  - level (integer)
  - hiddenUntil (Date)

# Models

- User

  - id (ObjectId)

  - username (string(32))
  - displayName (string(32))
  - passwordHash (string)
  - roles (ERole[])
  - quizzes (Quiz[])
  - lastLogin (Date)

  - createdAt (Date)
  - updatedAt (Date)

- Source

  - id (ObjectId)

  - title (string(100))
  - authors (string(100)[])
  - medium (EMediumType)
  - url (validatedURI)

  - createdBy (ObjectId)

  - publishedAt (Date)
  - lastAccessed (Date)

  - createdAt (Date)
  - updatedAt (Date)

- Note

  - id (ObjectId)

  - text (string(256))
  - sources (ObjectId[])
  - createdBy (ObjectId)

  - createdAt (Date)
  - updatedAt (Date)

- Quiz

  - id (ObjectId)

  - type (EQuizType -> prompt-response)
  - prompt (string(100))
  - choices (string(16)[])
  - correctResponses (string(16)[])

  - sources (ObjectId[])
  - notes (ObjectId[])
  - createdBy (ObjectId)
  - updatedBy (ObjectId)
  - contributors (ObjectId[])

  - createdAt (Date)
  - updatedAt (Date)
