-- Course Modules/Chapters
CREATE TABLE IF NOT EXISTS `course_modules` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `course_id` BIGINT NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `description` VARCHAR(1024),
    `order_index` INT DEFAULT 0,
    
    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    
    KEY `course_modules_course_id_idx` (`course_id`)
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS `user_progress` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `course_id` BIGINT NOT NULL,
    `module_id` BIGINT,
    `resource_id` BIGINT,
    `resource_type` ENUM("note", "quiz", "source") NOT NULL,
    
    `is_completed` TINYINT DEFAULT 0,
    `completed_at` TIMESTAMP NULL,
    `time_spent` INT DEFAULT 0, -- in seconds
    `last_accessed` TIMESTAMP NULL,
    
    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    
    UNIQUE KEY `user_progress_unique_idx` (`user_id`, `course_id`, `resource_id`, `resource_type`),
    KEY `user_progress_user_id_idx` (`user_id`),
    KEY `user_progress_course_id_idx` (`course_id`)
);

-- Dashboard Widgets Configuration
CREATE TABLE IF NOT EXISTS `dashboard_widgets` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `widget_type` ENUM("courses", "progress", "streak", "recent", "achievements") NOT NULL,
    `position` INT DEFAULT 0,
    `is_visible` TINYINT DEFAULT 1,
    
    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    
    UNIQUE KEY `dashboard_widgets_unique_idx` (`user_id`, `widget_type`),
    KEY `dashboard_widgets_user_id_idx` (`user_id`)
);

-- Daily Streaks
CREATE TABLE IF NOT EXISTS `daily_streaks` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL UNIQUE,
    
    `current_streak` INT DEFAULT 0,
    `longest_streak` INT DEFAULT 0,
    `last_activity_date` DATE,
    
    `created_at` TIMESTAMP DEFAULT NOW(),
    `updated_at` TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    
    KEY `daily_streaks_user_id_idx` (`user_id`)
);
