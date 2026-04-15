ALTER TABLE cycle_entries
  ADD COLUMN IF NOT EXISTS menstruates boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS amenorrhea_reason varchar(30) NULL,
  ADD COLUMN IF NOT EXISTS iud_type varchar(20) NULL,
  ADD COLUMN IF NOT EXISTS continuous_pill_name varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS surgery_type varchar(60) NULL,
  ADD COLUMN IF NOT EXISTS surgery_other_description varchar(200) NULL,
  ADD COLUMN IF NOT EXISTS amenorrhea_other_description varchar(200) NULL;
