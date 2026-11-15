-- ============================================================
-- Move September 2026 budgets to the active November 2026 cycle.
-- Safe for existing data: no tables are dropped/truncated and no seed is run.
-- Budget IDs, allocations, expense amounts, and descriptions are preserved.
-- September transaction dates shift by two months, retaining day-of-month.
-- If a user already has both budget months, this migration aborts and rolls
-- back instead of merging or overwriting either budget.
-- Safe to run on a database already migrated (no September budgets => no-op).
-- ============================================================

USE on_the_ledge;

DROP PROCEDURE IF EXISTS migrate_sep_2026_budgets_to_nov_2026;
DELIMITER //

CREATE PROCEDURE migrate_sep_2026_budgets_to_nov_2026()
BEGIN
    DECLARE v_conflicts INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS otl_sep_2026_budget_ids;
        RESIGNAL;
    END;

    DROP TEMPORARY TABLE IF EXISTS otl_sep_2026_budget_ids;
    CREATE TEMPORARY TABLE otl_sep_2026_budget_ids (
        budget_id INT PRIMARY KEY
    ) ENGINE=InnoDB;

    START TRANSACTION;

    INSERT INTO otl_sep_2026_budget_ids (budget_id)
    SELECT budget_id
    FROM budgets
    WHERE budget_month = '2026-09-01';

    SELECT COUNT(*)
      INTO v_conflicts
      FROM budgets AS september_budget
      JOIN budgets AS november_budget
        ON november_budget.user_id = september_budget.user_id
       AND november_budget.budget_month = '2026-11-01'
     WHERE september_budget.budget_month = '2026-09-01';

    IF v_conflicts > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Migration stopped: a user already has both September and November budgets. Review and reconcile that user''s budgets manually.';
    END IF;

    UPDATE budgets AS b
    JOIN otl_sep_2026_budget_ids AS moved
      ON moved.budget_id = b.budget_id
       SET b.budget_month = '2026-11-01';

    UPDATE transactions AS t
    JOIN otl_sep_2026_budget_ids AS moved
      ON moved.budget_id = t.budget_id
       SET t.transaction_date = DATE_ADD(t.transaction_date, INTERVAL 2 MONTH)
     WHERE t.transaction_date >= '2026-09-01'
       AND t.transaction_date < '2026-10-01';

    IF EXISTS (
        SELECT 1
        FROM transactions AS t
        JOIN otl_sep_2026_budget_ids AS moved
          ON moved.budget_id = t.budget_id
        JOIN budgets AS b
          ON b.budget_id = moved.budget_id
        WHERE b.budget_month = '2026-11-01'
          AND (
              t.transaction_date < '2026-11-01'
              OR t.transaction_date >= '2026-12-01'
          )
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Migration stopped: a September budget has transactions outside September 2026. Review those dates manually.';
    END IF;

    COMMIT;
    DROP TEMPORARY TABLE IF EXISTS otl_sep_2026_budget_ids;
END//

DELIMITER ;

CALL migrate_sep_2026_budgets_to_nov_2026();
DROP PROCEDURE IF EXISTS migrate_sep_2026_budgets_to_nov_2026;

-- Post-migration checks: allocation totals and November transaction dates.
SELECT
    b.user_id,
    b.budget_id,
    b.budget_month,
    b.total_amount,
    COALESCE(SUM(ba.allocated_amount), 0) AS allocation_total
FROM budgets AS b
LEFT JOIN budget_allocations AS ba ON ba.budget_id = b.budget_id
WHERE b.budget_month = '2026-11-01'
GROUP BY b.user_id, b.budget_id, b.budget_month, b.total_amount
ORDER BY b.user_id;

SELECT COUNT(*) AS november_budget_transactions_outside_november
FROM transactions AS t
JOIN budgets AS b ON b.budget_id = t.budget_id
WHERE b.budget_month = '2026-11-01'
  AND (
      t.transaction_date < '2026-11-01'
      OR t.transaction_date >= '2026-12-01'
  );
