import { useEffect, useState } from 'react';
import TurkeyBankSeeder from '@/shared/data/seed/turkey-bank';

interface SystemInitState {
  isInitializing: boolean;
  isComplete: boolean;
  error: string | null;
  progress: string;
}

export function useSystemInit() {
  const [state, setState] = useState<SystemInitState>({
    isInitializing: false,
    isComplete: false,
    error: null,
    progress: ''
  });

  useEffect(() => {
    let mounted = true;

    const checkAndInit = async () => {
      try {
        console.log('[SystemInit] Checking database state...');
        const isEmpty = await TurkeyBankSeeder.checkDatabaseEmpty();
        console.log('[SystemInit] Database empty?', isEmpty);

        if (!mounted) return;

        if (isEmpty) {
          setState({
            isInitializing: true,
            isComplete: false,
            error: null,
            progress: 'Sistem Hazırlanıyor...'
          });

          console.log('[SystemInit] Starting seeding process...');

          if (!mounted) return;
          setState(prev => ({ ...prev, progress: 'Demo Veriler Yükleniyor...' }));

          await TurkeyBankSeeder.seed();

          if (!mounted) return;
          console.log('[SystemInit] Seeding complete!');

          setState({
            isInitializing: false,
            isComplete: true,
            error: null,
            progress: ''
          });
        } else {
          console.log('[SystemInit] Database already populated, skipping seed');
          if (!mounted) return;
          setState({
            isInitializing: false,
            isComplete: true,
            error: null,
            progress: ''
          });
        }
      } catch (error) {
        console.error('[SystemInit] FATAL ERROR:', error);
        if (!mounted) return;
        setState({
          isInitializing: false,
          isComplete: true, // Set true to allow app to load
          error: null, // Don't show error to user
          progress: ''
        });
      }
    };

    checkAndInit();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
