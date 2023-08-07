<!-- This markdown can be viewed as a mindmap using the MarkMap VS Code extension.

MarkMap can also export the mindmap into an HTML file that uses SVG to draw the mindmap -->

# Enums

-   ERole
    -   user
    -   admin
    -   guest
-   EQuizType
    -   prompt-response
    -   multiple-choice
    -   fill-in-the-blank
    -   ordered-list-answer
    -   unordered-list-answer
    -   verbatim
-   EMediumType
    -   website
    -   book
    -   audio
    -   video
    -   periodical

# Types

-   TQuiz
    -   quizId (ObjectId)
    -   lastCorrect (Date)
    -   level (integer)
    -   hiddenUntil (Date)

-   TPermission
    -   group (ObjectId)
    -   permissions (integer)

# Models

-   User

    -   id (ObjectId)

    -   username (string(32))
    -   displayName (string(32))
    -   passwordHash (string)
    -   roles (ERole[])
    -   quizzes (Quiz[])
    -   lastLogin (Date)

    -   createdAt (Date)
    -   updatedAt (Date)

-   Group

    -   id (ObjectId)
    -   name (string(100))
    -   owner (ObjectId)
    -   users (ObjectId[])
    -   admins (ObjectId[])

-   Source

    -   id (ObjectId)

    -   title (string(100))
    -   authors (string(100)[])
    -   contributors (ObjectId[])
    -   medium (EMediumType)
    -   url (validatedURI)
    -   tags (string(16)[])

    -   addedBy (ObjectId)
    -   publishedAt (Date)
    -   lastAccessed (Date)

    -   createdAt (Date)
    -   updatedAt (Date)
    -   permissions (TPermission[])

-   Note

    -   id (ObjectId)

    -   text (string(256))
    -   sources (ObjectId[])
    -   contributors (ObjectId[])
    -   createdBy (ObjectId)

    -   createdAt (Date)
    -   updatedAt (Date)
    -   permissions (TPermission[])

-   Quiz

    -   id (ObjectId)

    -   type (EQuizType -> prompt-response)
    -   prompt (string(100))
    -   choices (string(32)[])
    -   correctResponses (string(32)[])

    -   sources (ObjectId[])
    -   notes (ObjectId[])
    -   createdBy (ObjectId)
    -   updatedBy (ObjectId)
    -   contributors (ObjectId[])

    -   createdAt (Date)
    -   updatedAt (Date)
    -   permissions (TPermission[])
