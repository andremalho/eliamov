CREATE TABLE IF NOT EXISTS daily_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid  NOT NULL,
  log_date          date  NOT NULL,
  cycle_phase       varchar(20) NOT NULL DEFAULT 'unknown',
  cycle_day         int NULL,
  energy_level      int NULL,
  mood_score        int NULL,
  libido            int NULL,
  sleep_quality     int NULL,
  sleep_hours       int NULL,
  pelvic_pain       int NULL,
  headache          int NULL,
  bloating          int NULL,
  breast_tenderness int NULL,
  back_pain         int NULL,
  nausea            int NULL,
  anxiety           int NULL,
  irritability      int NULL,
  concentration     int NULL,
  spotting          boolean NOT NULL DEFAULT false,
  hot_flashes       boolean NOT NULL DEFAULT false,
  night_sweats      boolean NOT NULL DEFAULT false,
  notes             text NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date
  ON daily_logs (user_id, log_date DESC);
