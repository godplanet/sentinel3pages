import { supabase } from '@/shared/api/supabase';
import { forceReseed } from '@/shared/data/seed/turkey-bank-final';

export interface SeedProgress {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  count?: number;
}

export class UniversalSeeder {
  private progress: SeedProgress[] = [];
  private onProgressUpdate?: (progress: SeedProgress[]) => void;

  constructor(onProgressUpdate?: (progress: SeedProgress[]) => void) {
    this.onProgressUpdate = onProgressUpdate;
  }

  private updateProgress(step: string, status: SeedProgress['status'], message: string, count?: number) {
    const existing = this.progress.find(p => p.step === step);
    if (existing) {
      existing.status = status;
      existing.message = message;
      existing.count = count;
    } else {
      this.progress.push({ step, status, message, count });
    }
    this.onProgressUpdate?.([...this.progress]);
  }

  async runFullSeed() {
    this.progress = [];
    this.updateProgress('seed', 'running', 'Running Turkey Bank seeder...');

    try {
      await forceReseed();
      this.updateProgress('seed', 'completed', 'All data seeded successfully');
      return { success: true, progress: this.progress };
    } catch (error) {
      this.updateProgress('seed', 'error', `Failed: ${error}`);
      return { success: false, error, progress: this.progress };
    }
  }

  async getTableCounts() {
    const tables = [
      'audit_entities',
      'risk_library',
      'user_profiles',
      'audit_engagements',
      'audit_findings',
      'workpapers',
      'action_plans',
    ];

    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        counts[table] = count || 0;
      } catch {
        counts[table] = -1;
      }
    }

    return counts;
  }
}
