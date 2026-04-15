ALTER TABLE mental_health_assessments
  ADD COLUMN IF NOT EXISTS critical_alert_triggered boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS critical_alert_reason varchar(20) NULL;

CREATE INDEX IF NOT EXISTS idx_mha_critical_alert
  ON mental_health_assessments (user_id, critical_alert_triggered)
  WHERE critical_alert_triggered = true;
