-- Back up old Users table into Users_old
-- Drop old Users table
-- Create new users table (lowercase)
-- Insert data from Users_old into columns of users

CREATE TABLE IF NOT EXISTS Users_old (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `displayName` VARCHAR (32),
    `description` VARCHAR(512),
    `avatar` VARCHAR(128),
    `passwordHash` VARCHAR(60),
    `refreshToken` VARCHAR(256)
);

INSERT IGNORE INTO Users_old
(id, username, displayName, `description`, avatar, passwordHash, refreshToken) 
SELECT id, username, displayName, `description`, avatar, passwordHash, refreshToken FROM Users;

DROP TABLE Users;

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(12) NOT NULL,

    -- Need this for case sensitivity
	`username` VARCHAR(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL UNIQUE,
    `display_name` VARCHAR (32) NOT NULL,

    `description` VARCHAR(512),
    `avatar` VARCHAR(128),
    `is_private` TINYINT DEFAULT 0,

    `password` VARCHAR(256),
    `tokens` JSON NOT NULL,

    `created_at` DATE DEFAULT CURRENT_DATE,
    `updated_at` DATE DEFAULT CURRENT_DATE,

    `is_deleted` TINYINT DEFAULT 0
);

INSERT IGNORE INTO users
(id, username, display_name, description, avatar, password)
SELECT id, username, displayName, description, avatar, passwordHash FROM Users_old;

-- Back up old Notifications table into Notifications_old
-- Drop old Notifications table
-- Create new notifications table (lowercase)
-- Insert data from Notifications_old into columns of notifications
CREATE TABLE IF NOT EXISTS `Notifications_old` (
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

INSERT INTO Notifications_old
(id, recipientId, senderId, groupId, type, subject, message, responseAction, isRead)
SELECT * from Notifications;

DROP TABLE Notifications;

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,

    `recipient_id` BIGINT NOT NULL,
    `sender_id` BIGINT,
    `group_id` BIGINT,

    -- Invite is for groups, request is for associates
    `type` ENUM("invite", "request", "message", "alert"),
    `subject` VARCHAR(32),
    `message` VARCHAR(256),

    -- Having a hard time understanding how this is useful
    `action` ENUM("Accept", "Decline", "Request", "Join", "Invite", "Ignore", "Send Message", "Reply", "Delete") NULL,
    `is_read` TINYINT DEFAULT 0
);

DROP TABLE Notifications;

INSERT IGNORE INTO notifications
(id, recipient_id, sender_id, group_id, `type`, `subject`, `message`, `action`, is_read)
SELECT id, recipientId, senderId, groupId, `type`, `subject`, `message`, responseAction, isRead FROM Notifications_old;


-- Back up old Associates table into Associates_old
-- Drop old Associates table
-- Create new associates table (lowercase)
-- Insert data from Associates_old into columns of associates
CREATE TABLE IF NOT EXISTS `Associates_old` (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE KEY `associates_AB_idx` (`A`, `B`),
    UNIQUE KEY `associates_BA_idx` (`B`, `A`)
);

INSERT IGNORE INTO Associates_old (id, A, B)
SELECT id, A, B FROM Associates;

DROP TABLE Associates;

CREATE TABLE IF NOT EXISTS `associates` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE KEY `associates_AB_idx` (`A`, `B`),
    UNIQUE KEY `associates_BA_idx` (`B`, `A`)
);

INSERT IGNORE INTO associates
(A, B)
SELECT A, B FROM Associates_old;


-- Back up old Groups table into Groups_old
-- Drop old Groups table
-- Create new groups table (lowercase)
-- Insert data from Groups_old into columns of groups
CREATE TABLE IF NOT EXISTS `Groups_old` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    -- public ID is for the URL
    `publicId` CHAR(12),
    `description` VARCHAR(512),
    `isPublic` BOOLEAN NOT NULL DEFAULT FALSE,
    `avatar` VARCHAR(128)
);

INSERT INGORE INTO Groups_old 
(id, `name`, publicId, `description`, isPublic, avatar)
SELECT id, `name`, publicId, `description`, isPublic, avatar FROM Groups;

DROP TABLE Groups;

CREATE TABLE IF NOT EXISTS `groups` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(12) NOT NULL,

    `name` VARCHAR(128) NOT NULL,
    `description` VARCHAR(512),
    `icon` VARCHAR(128),
    
    `is_public` TINYINT DEFAULT 0,

    `created_at` DATE DEFAULT CURRENT_DATE,
    `updated_at` DATE DEFAULT CURRENT_DATE,

    `is_deleted` TINYINT DEFAULT 0
);

INSERT IGNORE INTO groups
(id, public_id, `name`, `description`, is_public, icon)
SELECT id, publicId, `name`, `description`, isPublic, avatar FROM Groups_old;


-- Back up old Members table into Members_old
-- Drop old Members table
-- Create new members table (lowercase)
-- Insert data from Members_old into columns of members
CREATE TABLE IF NOT EXISTS `Members_old` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `groupId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `role` ENUM('owner', 'administrator', 'student', 'user')
);

INSERT INGORE INTO Members_old
(id, groupId, userId, `role`)
SELECT id, groupId, userId, `role` FROM Members;

DROP TABLE Members;

CREATE TABLE IF NOT EXISTS `members` (
    `group_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    `role` ENUM("owner", "admin", "student", "user"),

    UNIQUE KEY `members_group_id_user_id_idx` (`group_id`, `user_id`),
    KEY `members_user_id_idx` (`user_id`)
);

INSERT IGNORE INTO members
(group_id, user_id, `role`)
SELECT groupId, userId, `role` FROM Members_old;



-- Back up old Sources table into Sources_old
-- Drop old Sources table
-- Create new sources table (lowercase)
-- Insert data from Sources_old into columns of sources
CREATE TABLE IF NOT EXISTS `Sources_old` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(128) NOT NULL,
    `medium` ENUM('book', 'article', 'video', 'podcast', 'website', 'audio'),
    `url` VARCHAR(128),
    `tags` JSON NOT NULL,
    `createdBy` BIGINT NOT NULL,
    `publishedUpdated` DATE NULL,
    `lastAccessed` DATE NULL
);

INSERT IGNORE INTO Sources_old
(id, title, medium, `url`, tags, createdBy, publishedUpdated, lastAccessed);

DROP TABLE Sources;

CREATE TABLE IF NOT EXISTS `sources` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(12) NOT NULL,

    `title` VARCHAR(128) NOT NULL,
    `medium` ENUM("book", "article", "video", "podcast", "website", "audio"),
    `url` VARCHAR(128),

    `tags` JSON NOT NULL,
    `credits` JSON NOT NULL,
    `created_by` BIGINT NOT NULL,
    `last_accessed` DATE NULL,

    `all_read` TINYINT DEFAULT 0,
    `all_edit` TINYINT DEFAULT 0,
    `read` JSON NOT NULL,
    `edit` JSON NOT NULL,
    
    `created_at` DATE DEFAULT CURRENT_DATE,
    `updated_at` DATE DEFAULT CURRENT_DATE,

    `is_deleted` TINYINT DEFAULT 0
);

INSERT IGNORE INTO sources
(id, title, medium, `url`, tags, created_by, publishedUpdated, last_accessed)
SELECT id, title, medium, `url`, tags, createdBy, publishedUpdated, lastAccessed FROM Sources_old;