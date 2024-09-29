CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(6) NOT NULL,

    -- Need this for case sensitivity
	`username` VARCHAR(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL UNIQUE,
    `display_name` VARCHAR (32) NOT NULL,

    `email` VARCHAR(256) CHARACTER SET utf8 COLLATE utf8_bin NULL UNIQUE,
    `email_verified` TINYINT DEFAULT 0,
    `email_code` CHAR(6) NULL,
    `email_verification_token` CHAR(32) NULL,

    `description` VARCHAR(512),
    `avatar` VARCHAR(128),
    `settings` JSON NOT NULL,
    `is_private` TINYINT DEFAULT 0,

    `password` VARCHAR(256),
    `password_reset` CHAR(32) NULL,
    `password_reset_expiration` TIMESTAMP NULL,
    `tokens` JSON NOT NULL,

    `two_factor_enabled` TINYINT DEFAULT 0,
    `two_factor_secret` VARCHAR(128) NULL,
    `two_factor_temp` VARCHAR(128) NULL,
    `two_factor_recovery` JSON NULL,

    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

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
    `public_id` CHAR(6) NOT NULL,

    `name` VARCHAR(128) NOT NULL,
    `description` VARCHAR(512),
    `icon` VARCHAR(128),
    
    `is_public` TINYINT DEFAULT 0,

    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

    `created_by` BIGINT NOT NULL,

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
    `public_id` CHAR(6) NOT NULL,

    `title` VARCHAR(128) NOT NULL,
    `medium` ENUM("book", "article", "video", "podcast", "website", "audio"),
    `url` VARCHAR(512),

    `tags` JSON NOT NULL,
    `credits` JSON NOT NULL,
    `created_by` BIGINT NOT NULL,

    `published_at` TIMESTAMP NULL,
    `last_accessed` TIMESTAMP NULL,
    
    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

    `is_deleted` TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `notes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(6) NOT NULL,

    `title` VARCHAR(128) NOT NULL,
    `text` VARCHAR(8192) NOT NULL,

    `tags` JSON NOT NULL,
    `created_by` BIGINT NOT NULL,

    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

    `is_deleted` TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(6) NOT NULL,
    
    `type` ENUM("prompt-response", "multiple-choice", "fill-in-the-blank", "ordered-list-answer", "unordered-list-answer", "verbatim"),
    `prompt` VARCHAR(256),

    `choices` JSON NOT NULL,
    `answers` JSON NOT NULL,
    `hints` JSON NOT NULL,
    `tags` JSON NOT NULL,

    `created_by` BIGINT NOT NULL,

    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

    `is_deleted` TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `user_quizzes` (
    `user_id` BIGINT NOT NULL,
    `quiz_id` BIGINT NOT NULL,

    `level` INT DEFAULT 0,
    `tries_at_level` INT DEFAULT 0,
    `last_correct` TIMESTAMP DEFAULT NOW(),
    `hidden_until` TIMESTAMP DEFAULT NOW(),

    UNIQUE KEY `user_quizzes_user_id_quiz_id_idx` (`user_id`, `quiz_id`),
    KEY `user_quizzes_quiz_id_idx` (`quiz_id`)
);

CREATE TABLE IF NOT EXISTS `resource_contributors` (
    `resource_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    `type` ENUM("source", "note", "quiz"),

    UNIQUE KEY `resource_contributors_resource_id_user_id_idx` (`resource_id`, `user_id`),
    KEY `resource_contributors_user_id_idx` (`user_id`)
);

CREATE TABLE IF NOT EXISTS `courses` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `public_id` CHAR(6) NOT NULL,

    `name` VARCHAR(128),
    `description` VARCHAR(512),
    `enrollment` ENUM("open", "paid", "private"),

    `created_by` BIGINT NOT NULL,

    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

    `is_deleted` TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `course_users` (
    `course_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    `role` ENUM("owner", "tutor", "student") DEFAULT "student",
    `expiration` TIMESTAMP null,

    UNIQUE KEY `course_users_course_id_user_id_idx` (`course_id`, `user_id`),
    KEY `course_users_user_id_idx` (`user_id`)
);

CREATE TABLE IF NOT EXISTS `courses_hierarchy` (
    `inferior` BIGINT NOT NULL,
    `superior` BIGINT NOT NULL,

    `relationship` ENUM("prerequisite", "encompasses"),
    `average_level_required` INT DEFAULT 0,
    `minimum_level_required` INT DEFAULT 0,

    KEY `courses_hierarchy_inferior_idx` (`inferior`),
    KEY `courses_hierarchy_superior_idx` (`superior`)
);

CREATE TABLE IF NOT EXISTS `resource_relations` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    `A_type` ENUM("source", "note", "quiz", "course", "group"),
    `B_type` ENUM("source", "note", "quiz", "course", "group"),

    `include_reference` TINYINT DEFAULT 0,
    `reference` VARCHAR(128) NULL,
    `reference_type` ENUM("page", "id", "section", "timestamp", "url") NULL,

    UNIQUE KEY `resource_relations_AB_idx` (`A`, `B`, `A_type`, `B_type`),
    UNIQUE KEY `resource_relations_BA_idx` (`B`, `A`, `B_type`, `A_type`)
);

CREATE TABLE IF NOT EXISTS `resource_permissions` (
    `resource_id` BIGINT NOT NULL,
    `resource_type` ENUM("source", "note", "quiz", "course", "group"),

    `group_id` BIGINT NULL,
    `group_locked` TINYINT DEFAULT 0,

    `all_read` TINYINT DEFAULT 0,
    `all_write` TINYINT DEFAULT 0,

    `read` JSON NOT NULL,
    `write` JSON NOT NULL,

    KEY `resource_permissions_resource_id_idx` (`resource_id`),
    KEY `resource_permissions_group_id_idx` (`group_id`),

    -- can only have one row with same resource_id and resource_type
    UNIQUE KEY `resource_permissions_resource_id_resource_type_idx` (`resource_id`, `resource_type`),

    -- If all_edit is true, then all_read must be true
    CHECK (`all_write` = 0 OR `all_read` = 1)
);

CREATE TABLE IF NOT EXISTS `error_logs` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,

    `route` VARCHAR(256),
    `name` VARCHAR(256),
    `message` VARCHAR(1024),
    `code` VARCHAR(256),
    `stack` LONGTEXT,

    `triggered_at` TIMESTAMP DEFAULT NOW()
);
