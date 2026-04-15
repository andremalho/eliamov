ALTER TABLE mental_health_patterns
  ADD COLUMN IF NOT EXISTS phq9_trend varchar(20) NOT NULL DEFAULT 'insufficient_data',
  ADD COLUMN IF NOT EXISTS gad7_trend varchar(20) NOT NULL DEFAULT 'insufficient_data',
  ADD COLUMN IF NOT EXISTS phq9_trend_slope numeric(5,2) NULL,
  ADD COLUMN IF NOT EXISTS gad7_trend_slope numeric(5,2) NULL,
  ADD COLUMN IF NOT EXISTS adherence_score numeric(5,2) NULL,
  ADD COLUMN IF NOT EXISTS suggested_next_assessment_days int NULL,
  ADD COLUMN IF NOT EXISTS clinician_alert_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clinician_alert_reason varchar(60) NULL;
