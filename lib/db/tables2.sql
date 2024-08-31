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

CREATE TABLE IF NOT EXISTS `associates` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE KEY `associates_AB_idx` (`A`, `B`),
    UNIQUE KEY `associates_BA_idx` (`B`, `A`)
);

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

CREATE TABLE IF NOT EXISTS `members` (
    `group_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    `role` ENUM("owner", "admin", "student", "user"),

    UNIQUE KEY `members_group_id_user_id_idx` (`group_id`, `user_id`),
    KEY `members_user_id_idx` (`user_id`)
);

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

CREATE TABLE IF NOT EXISTS `notes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(12) NOT NULL,

    `title` VARCHAR(128) NOT NULL,
    `text` VARCHAR(8192) NOT NULL,

    `tags` JSON NOT NULL,
    `created_by` BIGINT NOT NULL,

    `all_read` TINYINT DEFAULT 0,
    `all_edit` TINYINT DEFAULT 0,
    `read` JSON NOT NULL,
    `edit` JSON NOT NULL,

    `created_at` DATE DEFAULT CURRENT_DATE,
    `updated_at` DATE DEFAULT CURRENT_DATE,

    `is_deleted` TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(12) NOT NULL,
    
    `type` ENUM("prompt-response", "multiple-choice", "fill-in-the-blank", "ordered-list-answer", "unordered-list-answer", "verbatim"),
    `prompt` VARCHAR(256),

    `choices` JSON NOT NULL,
    `answers` JSON NOT NULL,
    `hints` JSON NOT NULL,
    `tags` JSON NOT NULL,

    `created_by` BIGINT NOT NULL,

    `all_read` TINYINT DEFAULT 0,
    `all_edit` TINYINT DEFAULT 0,
    `read` JSON NOT NULL,
    `edit` JSON NOT NULL,

    `created_at` DATE DEFAULT CURRENT_DATE,
    `updated_at` DATE DEFAULT CURRENT_DATE,

    `is_deleted` TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `user_quizzes` (
    `user_id` BIGINT NOT NULL,
    `quiz_id` BIGINT NOT NULL,

    `last_correct` DATE DEFAULT CURRENT_DATE,
    `level` INT DEFAULT 0,
    `hidden_until` DATE DEFAULT CURRENT_DATE,

    UNIQUE KEY `user_quizzes_user_id_quiz_id_idx` (`user_id`, `quiz_id`),
    KEY `user_quizzes_quiz_id_idx` (`quiz_id`)
);

CREATE TABLE IF NOT EXISTS `resource_contributors` (
    `resource_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    `type` ENUM("note", "quiz"),

    UNIQUE KEY `resource_contributors_resource_id_user_id_idx` (`resource_id`, `user_id`),
    KEY `resource_contributors_user_id_idx` (`user_id`)
);

CREATE TABLE IF NOT EXISTS `courses` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(12) NOT NULL,

    `name` VARCHAR(128),
    `description` VARCHAR(512),
    `enrollment` ENUM("open", "paid", "private"),
    `tags` JSON NOT NULL,

    `all_read` TINYINT DEFAULT 0,
    `all_edit` TINYINT DEFAULT 0,
    `read` JSON NOT NULL,
    `edit` JSON NOT NULL,
    `locked` TINYINT DEFAULT 0,

    `created_by` BIGINT NOT NULL,

    `created_at` DATE DEFAULT CURRENT_DATE,
    `updated_at` DATE DEFAULT CURRENT_DATE,

    `is_deleted` TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `course_users` (
    `course_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    `role` ENUM("owner", "tutor", "student"),
    `expiration` DATE DEFAULT (CURRENT_DATE + INTERVAL 200 YEAR),

    UNIQUE KEY `course_users_course_id_user_id_idx` (`course_id`, `user_id`),
    KEY `course_users_user_id_idx` (`user_id`)
);

CREATE TABLE IF NOT EXISTS `courses_hierarchy` (
    `inferior` BIGINT NOT NULL,
    `superior` BIGINT NOT NULL,

    `relationship` ENUM("prerequisite", "encompasses"),
    `average_level_required` INT DEFAULT 0,

    KEY `courses_hierarchy_inferior_idx` (`inferior`),
    KEY `courses_hierarchy_superior_idx` (`superior`)
);

CREATE TABLE IF NOT EXISTS `course_resources` (
    `course_id` BIGINT NOT NULL,
    `resource_id` BIGINT NOT NULL,

    `type` ENUM("source", "note", "quiz"),
    `include_referencing_resources` TINYINT DEFAULT 0,

    UNIQUE KEY `course_resources_course_id_resource_id_idx` (`course_id`, `resource_id`),
    KEY `course_resources_resource_id_idx` (`resource_id`)
);

CREATE TABLE IF NOT EXISTS `error_logs` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,

    `route` VARCHAR(256),
    `name` VARCHAR(256),
    `message` VARCHAR(1024),
    `code` VARCHAR(256),
    `stack` LONGTEXT,

    `triggered_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
