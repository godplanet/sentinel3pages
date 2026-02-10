import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/app/layout/AppShell';
import { AppRoutes } from '@/app/routes';
import { SystemInitOverlay } from '@/app/layout/SystemInitOverlay';
import { useSystemInit } from '@/shared/hooks/useSystemInit';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isInitializing, isComplete, error, progress } = useSystemInit();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {isInitializing && (
          <SystemInitOverlay progress={progress} error={error} />
        )}
        {isComplete && (
          <AppShell>
            <AppRoutes />
          </AppShell>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
