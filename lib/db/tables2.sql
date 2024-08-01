CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `publicId` CHAR(12) NOT NULL,

    -- Need this for case sensitivity
	`username` VARCHAR(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL UNIQUE,
    `displayName` VARCHAR (32) NOT NULL,

    `description` VARCHAR(512),
    `avatar` VARCHAR(128),

    `password` VARCHAR(256),
    `tokens` JSON
);

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,

    `recipientId` BIGINT NOT NULL,
    `senderId` BIGINT,
    `groupId` BIGINT,

    -- Invite is for groups, request is for associates
    `type` ENUM("invite", "request", "message", "alert"),
    `subject` VARCHAR(32),
    `message` VARCHAR(256),

    -- Having a hard time understanding how this is useful
    `action` ENUM("Accept", "Decline", "Request", "Join", "Invite", "Ignore", "Send Message", "Reply"),
    `isRead` TINYINT DEFAULT 0,
);

CREATE TABLE IF NOT EXISTS `associates` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE KEY `associates_AB_idx` (`A`, `B`),
    UNIQUE KEY `associates_BA_idx` (`B`, `A`)
);

CREATE TABLE IF NOT EXISTS `groups` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `publicId` CHAR(12) NOT NULL,

    `name` VARCHAR(128) NOT NULL,
    `description` VARCHAR(512),
    
    `isPublic` TINYINT DEFAULT 0,
);

CREATE TABLE IF NOT EXISTS `members` (
    groupId BIGINT NOT NULL,
    userId BIGINT NOT NULL,

    role ENUM("owner", "admin", "student", "user"),

    UNIQUE KEY `members_groupId_userId_idx` (`groupId`, `userId`)
    KEY `members_userId_idx` (`userId`)
);

CREATE TABLE IF NOT EXISTS `sources` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `publicId` CHAR(12) NOT NULL,

    `title` VARCHAR(128) NOT NULL,
    `medium` ENUM("book", "article", "video", "podcast", "website", "audio"),
    `url` VARCHAR(128),

    `tags` JSON NOT NULL,
    -- If we drop the `sourceCredits` table, we can just store the credits here
    -- `credits` JSON NOT NULL,
    `createdBy` BIGINT NOT NULL,
    
    `createdAt` DATE DEFAULT CURRENT_DATE,
    `updatedAt` DATE DEFAULT CURRENT_DATE ON UPDATE CURRENT_DATE
);

-- We can drop this table, or we can store authors or other credits in a table
-- this would allow us to filter easily by author or other credit type
-- We'd then have a credits table and a sourcesCredits relation table because
-- each source can have multiple credits and each credit can be associated with
-- multiple sources
CREATE TABLE IF NOT EXISTS `sourceCredits` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `sourceId` BIGINT NOT NULL,

    `type` VARCHAR(32) DEFAULT "Author"
    `name` VARCHAR(64),
);

CREATE TABLE IF NOT EXISTS `notes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    publicId CHAR(12) NOT NULL,

    `title` VARCHAR(128) NOT NULL,
    `text` VARCHAR(8192) NOT NULL,

    `tags` JSON NOT NULL,
    `createdBy` BIGINT NOT NULL,

    `createdAt` DATE DEFAULT CURRENT_DATE,
    `updatedAt` DATE DEFAULT CURRENT_DATE ON UPDATE CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `publicId` CHAR(12) NOT NULL,
    
    `type` ENUM("prompt-response", "multiple-choice", "fill-in-the-blank", "ordered-list-answer", "unordered-list-answer", "verbatim"),
    `prompt` VARCHAR(256),

    `choices` JSON NULL,
    `answers` JSON NOT NULL,
    `hints` JSON NOT NULL,
    `tags` JSON NOT NULL,

    `createdBy` BIGINT NOT NULL,

    `createdAt` DATE DEFAULT CURRENT_DATE,
    `updatedAt` DATE DEFAULT CURRENT_DATE ON UPDATE CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS `userQuizzes` (
    `userId` BIGINT NOT NULL,
    `quizId` BIGINT NOT NULL,

    `lastCorrect` DATE DEFAULT CURRENT_DATE,
    `level` INT DEFAULT 0,
    `hiddenUntil` DATE DEFAULT CURRENT_DATE,

    UNIQUE KEY `userQuizzes_userId_quizId_idx` (`userId`, `quizId`)
    KEY `userQuizzes_quizId_idx` (`quizId`)
);

-- Not sure what this is for
CREATE TABLE IF NOT EXISTS QuizNotes (
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
    userType ENUM("owner", "tutor", "student"),
    enrollmentExpiration DATE DEFAULT (CURRENT_DATE + INTERVAL 200 YEAR)
);

CREATE TABLE IF NOT EXISTS CourseHierarchy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inferiorCourse BIGINT NOT NULL,
    superiorCourse BIGINT NOT NULL,
    relationship ENUM("prerequisite", "encompasses"),
    averageLevelRequired INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS CourseResources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    courseId BIGINT NOT NULL,
    resourceId BIGINT NOT NULL,
    resourceType ENUM("source", "note", "quiz"),
    includeReferencingResources BOOLEAN
);

CREATE TABLE IF NOT EXISTS ResourcePermissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resourceId BIGINT NOT NULL,
    resourceType ENUM("source", "note", "quiz", "course", "user", "group"),
    permitAll BOOLEAN DEFAULT FALSE,
    permissionType ENUM("read", "write"),
    permittedId BIGINT,
    permittedType ENUM ("user", "group")
);
