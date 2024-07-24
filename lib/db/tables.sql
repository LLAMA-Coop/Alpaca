CREATE TABLE IF NOT EXISTS Users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32) NOT NULL,
    displayName VARCHAR (32),
    description VARCHAR(512),
    avatar VARCHAR(128),
    passwordHash VARCHAR(60),
    refreshToken VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS Notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM("group invitation", "associate invitation", "message"),
    recipientId BIGINT NOT NULL,
    senderId BIGINT,
    groupId BIGINT,
    subject VARCHAR(32),
    message VARCHAR(256),
    responseAction ENUM("Accept","Decline", "Request", "Join", "Invite", "Ignore", "Send Message", "Reply"),
    isRead BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Associations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user1id BIGINT NOT NULL,
    user2id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS Groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    isPublic BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS GroupUsers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    groupId BIGINT NOT NULL,
    userId BIGINT NOT NULL,
    userRole ENUM("owner", "administrator", "user")
);

CREATE TABLE IF NOT EXISTS Sources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
    medium ENUM("book", "article", "video", "podcast", "website", "audio"),
    url VARCHAR(128),
    tags json NOT NULL,
    createdBy BIGINT NOT NULL,
    publishedUpdated DATE NULL
);

CREATE TABLE IF NOT EXISTS SourceCredits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sourceId BIGINT NOT NULL,
    name VARCHAR(64),
    type VARCHAR(32) DEFAULT "Author"
);

CREATE TABLE IF NOT EXISTS Notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
    text VARCHAR(8192) NOT NULL,
    tags json NOT NULL,
    sourceId BIGINT NOT NULL,
    createdBy BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS Quizzes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM("prompt-response", "multiple-choice", "fill-in-the-blank", "ordered-list-answer", "unordered-list-answer", "verbatim"),
    prompt VARCHAR(256),
    choices json NULL,
    correctResponses json NOT NULL,
    hints json NOT NULL,
    tags json NOT NULL,
    createdBy BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS QuizNotes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quizId BIGINT NOT NULL,
    noteId BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS ResourceContributors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resourceId BIGINT NOT NULL,
    resourceType ENUM("note", "quiz"),
    userId BIGINT NOT NULL,
    date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS ResourceSources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resourceId BIGINT NOT NULL,
    resourceType ENUM("note", "quiz"),
    sourceId BIGINT NOT NULL,
    locInSource VARCHAR(32),
    locType ENUM("page", "id reference", "section", "timestamp")
);

CREATE TABLE IF NOT EXISTS Courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(128),
    description VARCHAR(512),
    enrollment ENUM("open", "paid", "private"),
    createdBy BIGINT NOT NULL,
    createdDate DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS CourseUsers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    courseId BIGINT NOT NULL,
    userId BIGINT NOT NULL,
    userType ENUM("owner", "tutor", "student")
);

CREATE TABLE IF NOT EXISTS CourseHierarchy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inferiorCourse BIGINT NOT NULL,
    superiorCourse BIGINT NOT NULL,
    relationship ENUM("prerequisite", "encompasses")
);

CREATE TABLE IF NOT EXISTS ResourcePermissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resourceId BIGINT NOT NULL,
    resourceType ENUM("source", "note", "quiz", "course", "user"),
    permitAll BOOLEAN DEFAULT FALSE,
    permissionType ENUM("read", "write"),
    permittedId BIGINT NOT NULL,
    permittedType ENUM ("user", "group")
);