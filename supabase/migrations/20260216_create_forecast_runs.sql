-- Create forecast_runs table for storing time series forecast results
CREATE TABLE IF NOT EXISTS forecast_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('spend', 'velocity', 'bugs')),
  scenario TEXT NOT NULL CHECK (scenario IN ('optimistic', 'realistic', 'pessimistic')),
  model TEXT NOT NULL CHECK (model IN ('sma', 'ema', 'holt')),
  params JSONB NOT NULL,
  horizon INTEGER NOT NULL CHECK (horizon > 0),
  mae DECIMAL,
  mape DECIMAL,
  result_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_forecast_runs_project_id ON forecast_runs(project_id);
CREATE INDEX idx_forecast_runs_created_at ON forecast_runs(created_at DESC);

-- Enable RLS
ALTER TABLE forecast_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own forecast runs"
  ON forecast_runs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create forecast runs for their projects"
  ON forecast_runs FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own forecast runs"
  ON forecast_runs FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
