/*
  # Dev Mode Permissive Policies

  Adds permissive write policies for development environment.
  These allow anonymous/unauthenticated access to user_profiles 
  and system_integrations tables during active development.

  ## Changes
  - Add public write policy on user_profiles (INSERT, UPDATE)
  - Add public write policy on system_integrations (INSERT, UPDATE)

  ## Important
  - These policies MUST be replaced with strict tenant-based 
    policies before production deployment.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Dev mode public insert'
  ) THEN
    CREATE POLICY "Dev mode public insert"
      ON user_profiles FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Dev mode public update'
  ) THEN
    CREATE POLICY "Dev mode public update"
      ON user_profiles FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_integrations' AND policyname = 'Dev mode public write'
  ) THEN
    CREATE POLICY "Dev mode public write"
      ON system_integrations FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_integrations' AND policyname = 'Dev mode public update'
  ) THEN
    CREATE POLICY "Dev mode public update"
      ON system_integrations FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
