CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS hormonal_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  analyzed_cycle_count int NOT NULL,
  avg_cycle_length numeric(6,2) NULL,
  cycle_variability numeric(6,2) NULL,
  cycle_trend_slope numeric(6,2) NULL,
  aub_risk_score numeric(5,2) NOT NULL DEFAULT 0,
  perimenopause_score numeric(5,2) NOT NULL DEFAULT 0,
  aub_risk_level varchar(30) NOT NULL,
  hormonal_status varchar(60) NOT NULL,
  patient_summary text NOT NULL,
  clinician_summary text NOT NULL,
  raw_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hormonal_insights_user_created
  ON hormonal_insights (user_id, created_at DESC);
