import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppShell } from '@/app/layout/AppShell';
import { AppRoutes } from '@/app/routes';
import { UniversalSeeder } from '@/shared/data/seed';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingComplete, setSeedingComplete] = useState(false);

  useEffect(() => {
    async function initializeData() {
      try {
        const isEmpty = await UniversalSeeder.checkDatabaseEmpty();

        if (isEmpty && !isSeeding) {
          console.log('📦 Database is empty. Starting data seeding...');
          setIsSeeding(true);
          await UniversalSeeder.seed();
          setSeedingComplete(true);
          setIsSeeding(false);
          console.log('✅ Demo verileri yüklendi! (Demo data loaded!)');
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setIsSeeding(false);
      }
    }

    initializeData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {isSeeding ? (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Sentinel v3.0</h2>
              <p className="text-slate-600">Demo verileri yükleniyor...</p>
              <p className="text-sm text-slate-500 mt-2">Lütfen bekleyin, bu işlem birkaç saniye sürebilir.</p>
            </div>
          </div>
        ) : (
          <AppShell>
            <AppRoutes />
          </AppShell>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
