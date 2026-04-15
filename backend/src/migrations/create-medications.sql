CREATE TABLE IF NOT EXISTS medications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL,
  name         varchar(150) NOT NULL,
  category     varchar(30)  NOT NULL,
  dose         varchar(80)  NULL,
  frequency    varchar(80)  NULL,
  start_date   date         NOT NULL,
  end_date     date         NULL,
  active       boolean      NOT NULL DEFAULT true,
  notes        text         NULL,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medications_user_active
  ON medications (user_id, active);

CREATE INDEX IF NOT EXISTS idx_medications_user_start
  ON medications (user_id, start_date DESC);
