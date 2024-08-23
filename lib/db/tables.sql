CREATE TABLE IF NOT EXISTS `Users` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `displayName` VARCHAR (32),
    `description` VARCHAR(512),
    `avatar` VARCHAR(128),
    `passwordHash` VARCHAR(60),
    `refreshToken` VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS `Notifications` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `recipientId` BIGINT NOT NULL,
    `senderId` BIGINT,
    `groupId` BIGINT,

    -- Invite is for groups, request is for associates
    `type` ENUM('invite', 'request', 'message', 'alert'),
    `subject` VARCHAR(32),
    `message` VARCHAR(256),
    `responseAction` ENUM('Accept','Decline', 'Request', 'Join', 'Invite', 'Ignore', 'Send Message', 'Reply', 'Delete'),
    `isRead` BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS `Associates` (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE KEY `associates_AB_idx` (`A`, `B`),
    UNIQUE KEY `associates_BA_idx` (`B`, `A`)
);

CREATE TABLE IF NOT EXISTS `Groups` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    -- public ID is for the URL
    `publicId` CHAR(12),
    `description` VARCHAR(512),
    `isPublic` BOOLEAN NOT NULL DEFAULT FALSE,
    `avatar` VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS `Members` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `groupId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `role` ENUM('owner', 'administrator', 'student', 'user')
);

CREATE TABLE IF NOT EXISTS `Sources` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(128) NOT NULL,
    `medium` ENUM('book', 'article', 'video', 'podcast', 'website', 'audio'),
    `url` VARCHAR(128),
    `tags` JSON NOT NULL,
    `createdBy` BIGINT NOT NULL,
    `publishedUpdated` DATE NULL,
    `lastAccessed` DATE NULL
);

CREATE TABLE IF NOT EXISTS `SourceCredits` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `sourceId` BIGINT NOT NULL,
    `name` VARCHAR(64),
    `type` VARCHAR(32) DEFAULT 'Author',

    CONSTRAINT UNIQUE (`sourceId`, `name`, `type`)
);

CREATE TABLE IF NOT EXISTS `Notes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(128) NOT NULL,
    `text` VARCHAR(8192) NOT NULL,
    `tags` JSON NOT NULL,
    `createdBy` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `Quizzes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `type` ENUM('prompt-response', 'multiple-choice', 'fill-in-the-blank', 'ordered-list-answer', 'unordered-list-answer', 'verbatim'),
    `prompt` VARCHAR(256),
    `choices` JSON NULL,
    `correctResponses` JSON NOT NULL,
    `hints` JSON NOT NULL,
    `tags` JSON NOT NULL,
    `createdBy` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `UserQuizzes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `quizId` BIGINT NOT NULL,
    `lastCorrect` DATE DEFAULT CURRENT_DATE,
    `level` INT DEFAULT 0,
    `hiddenUntil` DATE DEFAULT CURRENT_DATE,
    UNIQUE KEY userQuizCombo (`userId`, `quizId`)
);

CREATE TABLE IF NOT EXISTS `QuizNotes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `quizId` BIGINT NOT NULL,
    `noteId` BIGINT NOT NULL,

    CONSTRAINT UNIQUE (`quizId`, `noteId`)
);

CREATE TABLE IF NOT EXISTS `ResourceContributors` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `resourceId` BIGINT NOT NULL,
    `resourceType` ENUM('source', 'note', 'quiz', 'course'),
    `userId` BIGINT NOT NULL,
    `date` DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS `ResourceSources` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `resourceId` BIGINT NOT NULL,
    `resourceType` ENUM('note', 'quiz'),
    `sourceId` BIGINT NOT NULL,
    `locInSource` VARCHAR(32),
    `locType` ENUM('page', 'id reference', 'section', 'timestamp', 'url'),

    UNIQUE KEY `sourceInfo` (`resourceId`, `resourceType`, `sourceId`)
);

CREATE TABLE IF NOT EXISTS `Courses` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(128),
    `description` VARCHAR(512),
    `enrollment` ENUM('open', 'paid', 'private'),
    `createdBy` BIGINT NOT NULL,
    `createdDate` DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS `CourseUsers` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `courseId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `userType` ENUM('owner', 'tutor', 'student'),
    `enrollmentExpiration` DATE DEFAULT (CURRENT_DATE + INTERVAL 200 YEAR)
);

CREATE TABLE IF NOT EXISTS `CourseHierarchy` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `inferiorCourse` BIGINT NOT NULL,
    `superiorCourse` BIGINT NOT NULL,
    `relationship` ENUM('prerequisite', 'encompasses'),
    `averageLevelRequired` INT DEFAULT 0,
    `minimumLevelRequired` INT DEFAULT 0,

    CONSTRAINT UNIQUE (`inferiorCourse`, `superiorCourse`, `relationship`)
);

CREATE TABLE IF NOT EXISTS `CourseResources` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `courseId` BIGINT NOT NULL,
    `resourceId` BIGINT NOT NULL,
    `resourceType` ENUM('source', 'note', 'quiz'),
    `includeReferencingResources` BOOLEAN,

    UNIQUE KEY `resourceInfo` (`courseId`, `resourceId`, `resourceType`)
);

CREATE TABLE IF NOT EXISTS `ResourcePermissions` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `resourceId` BIGINT NOT NULL,
    `resourceType` ENUM('source', 'note', 'quiz', 'course', 'user', 'group') NOT NULL,
    `permitAll` BOOLEAN DEFAULT FALSE,
    `permissionType` ENUM('read', 'write', 'none') DEFAULT 'read',
    `permittedId` BIGINT DEFAULT NULL,
    `permittedType` ENUM ('user', 'group') DEFAULT NULL,

    UNIQUE KEY `uniquePermission` (
        `resourceId`, `resourceType`, `permittedId`, `permittedType`
    ),
    CHECK (
        (`permitAll` = TRUE AND `permittedId` IS NULL AND `permittedType` IS NULL)
        OR
        (`permitAll` = FALSE AND `permittedId` IS NOT NULL AND `permittedType` IS NOT NULL)
    )
);