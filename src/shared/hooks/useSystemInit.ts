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
    const checkAndInit = async () => {
      try {
        const isEmpty = await TurkeyBankSeeder.checkDatabaseEmpty();

        if (isEmpty) {
          setState({
            isInitializing: true,
            isComplete: false,
            error: null,
            progress: 'Sistem Hazırlanıyor...'
          });

          setState(prev => ({ ...prev, progress: 'Sentinel Katılım Bankası Verileri Yükleniyor...' }));

          await TurkeyBankSeeder.seed();

          setState({
            isInitializing: false,
            isComplete: true,
            error: null,
            progress: 'Sistem Hazır!'
          });
        } else {
          setState({
            isInitializing: false,
            isComplete: true,
            error: null,
            progress: ''
          });
        }
      } catch (error) {
        console.error('System initialization failed:', error);
        setState({
          isInitializing: false,
          isComplete: false,
          error: error instanceof Error ? error.message : 'Sistem başlatılamadı',
          progress: ''
        });
      }
    };

    checkAndInit();
  }, []);

  return state;
}
