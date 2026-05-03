-- Make course_id nullable for general progress tracking
ALTER TABLE `user_progress` 
MODIFY COLUMN `course_id` BIGINT NULL,
DROP INDEX `user_progress_unique_idx`,
ADD UNIQUE KEY `user_progress_unique_idx` (`user_id`, `course_id`, `resource_id`, `resource_type`);

ALTER TABLE `daily_streaks`
MODIFY COLUMN `current_streak` INT DEFAULT 0,
MODIFY COLUMN `longest_streak` INT DEFAULT 0;

-- Add index for faster queries
ALTER TABLE `user_progress`
ADD INDEX `user_progress_completed_idx` (`user_id`, `is_completed`, `lastAccessed`);
