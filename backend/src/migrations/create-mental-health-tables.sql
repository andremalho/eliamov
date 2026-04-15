CREATE TABLE IF NOT EXISTS mental_health_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assessment_type varchar(10) NOT NULL,
  answers jsonb NOT NULL,
  total_score int NOT NULL,
  severity_level varchar(40) NOT NULL,
  cycle_phase_at_assessment varchar(20) NOT NULL DEFAULT 'unknown',
  cycle_day int NULL,
  clinical_note text NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mha_user_created ON mental_health_assessments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mha_user_type ON mental_health_assessments (user_id, assessment_type, created_at DESC);

CREATE TABLE IF NOT EXISTS mental_health_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  avg_phq9_score numeric(5,2) NULL,
  avg_gad7_score numeric(5,2) NULL,
  avg_pss10_score numeric(5,2) NULL,
  luteal_phq9_avg numeric(5,2) NULL,
  follicular_phq9_avg numeric(5,2) NULL,
  luteal_gad7_avg numeric(5,2) NULL,
  follicular_gad7_avg numeric(5,2) NULL,
  pmdd_suspected boolean NOT NULL DEFAULT false,
  general_depression_suspected boolean NOT NULL DEFAULT false,
  general_anxiety_suspected boolean NOT NULL DEFAULT false,
  overall_pattern varchar(40) NOT NULL DEFAULT 'stable',
  patient_summary text NOT NULL,
  clinician_summary text NOT NULL,
  analyzed_assessment_count int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mhp_user_created ON mental_health_patterns (user_id, created_at DESC);
