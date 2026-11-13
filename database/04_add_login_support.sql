-- ============================================================
-- Add local login support to the existing on_the_ledge database.
-- Does not drop tables or rows.
-- Safe to re-run: the column is added only when it is missing.
-- Demo passwords (bcrypt cost 10):
--   aarav2026, riya2026, kabir2026, ananya2026, vihaan2026
-- ============================================================

USE on_the_ledge;

SET @has_hash := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'on_the_ledge'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'password_hash'
);

SET @ddl := IF(
    @has_hash = 0,
    'ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL',
    'SELECT ''password_hash already exists'' AS note'
);

PREPARE add_password_hash FROM @ddl;
EXECUTE add_password_hash;
DEALLOCATE PREPARE add_password_hash;

UPDATE users
SET password_hash = '$2b$10$yrTSaRqu.OU/PNDkmJJ7AOqdWgBDDdEC1x2ax3mt8mhMAMbvBb2iG'
WHERE first_name = 'Aarav' AND last_name = 'Sharma';

UPDATE users
SET password_hash = '$2b$10$2LO2PB3hd64opYB7ba3yje6kGkXXhFwAqES6XWfM2lAFuEBRHrC22'
WHERE first_name = 'Riya' AND last_name = 'Mehta';

UPDATE users
SET password_hash = '$2b$10$B/tzVamzDDS8Q18JxjK/CedTxU0eo7hT/hYxLCVuH992OG53XQeU2'
WHERE first_name = 'Kabir' AND last_name = 'Shah';

UPDATE users
SET password_hash = '$2b$10$Hl.JruIUNA9zaFXynehCU.Bh310gLReFtgV67QdSfddFk0hJ1ZNXW'
WHERE first_name = 'Ananya' AND last_name = 'Rao';

UPDATE users
SET password_hash = '$2b$10$lpaxwlO/RX4WrN7NEOrXSeYBq7e23zs6xJFdgVfzpOfSongH8Tzj6'
WHERE first_name = 'Vihaan' AND last_name = 'Patel';

ALTER TABLE users
    MODIFY password_hash VARCHAR(255) NOT NULL;

SELECT user_id, first_name, email,
       IF(password_hash IS NULL OR password_hash = '', 'MISSING', 'SET') AS password_status
FROM users
ORDER BY user_id;
