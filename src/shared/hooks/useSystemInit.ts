import { useEffect, useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { forceReseedViaEdge } from '@/shared/lib/universal-seeder';

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

        // Check if users exist
        const { count, error: checkError } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        if (!mounted) return;

        const isEmpty = checkError || count === 0;
        console.log('[SystemInit] Database empty?', isEmpty, 'User count:', count);

        if (isEmpty) {
          setState({
            isInitializing: true,
            isComplete: false,
            error: null,
            progress: 'Sistem Onarılıyor ve Veriler Yükleniyor...'
          });

          console.log('[SystemInit] Running Force Reseed (Nuclear Wipe + Turkey Bank)...');

          if (!mounted) return;
          setState(prev => ({ ...prev, progress: 'Veritabanı Temizleniyor (Nuclear Wipe)...' }));

          // Small delay to ensure UI renders
          await new Promise(resolve => setTimeout(resolve, 500));

          if (!mounted) return;
          setState(prev => ({ ...prev, progress: 'Sentinel Katılım Bankası Yükleniyor...' }));

          await forceReseedViaEdge();

          if (!mounted) return;
          console.log('[SystemInit] Force reseed complete!');

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
          error: error instanceof Error ? error.message : 'Unknown error',
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
