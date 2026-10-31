USE society_management;

ALTER TABLE feedback MODIFY COLUMN resident_id INT NULL;

SET @feedback_user_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'feedback'
      AND COLUMN_NAME = 'user_id'
);

SET @feedback_user_column_sql = IF(
    @feedback_user_column_exists = 0,
    'ALTER TABLE feedback ADD COLUMN user_id INT NULL AFTER resident_id',
    'SELECT 1'
);

PREPARE feedback_user_column_statement FROM @feedback_user_column_sql;
EXECUTE feedback_user_column_statement;
DEALLOCATE PREPARE feedback_user_column_statement;

SET @feedback_user_fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'feedback'
      AND CONSTRAINT_NAME = 'fk_feedback_user'
);

SET @feedback_user_fk_sql = IF(
    @feedback_user_fk_exists = 0,
    'ALTER TABLE feedback ADD CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT 1'
);

PREPARE feedback_user_fk_statement FROM @feedback_user_fk_sql;
EXECUTE feedback_user_fk_statement;
DEALLOCATE PREPARE feedback_user_fk_statement;