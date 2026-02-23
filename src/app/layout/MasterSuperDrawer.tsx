import React, { Suspense, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useUIStore } from '@/shared/stores/ui-store';
import { cn } from '@/lib/utils';

// --- LAZY LOADED DRAWERS ---
// Not: İleride var olan çekmece bileşenlerinizi buralara bağlayacağız.
// Örn: const FindingStudioDrawer = React.lazy(() => import('@/features/finding-studio/components/FindingDrawer'));

const PlaceholderDrawer = ({ type, entityId }: { type: string, entityId: string | null }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center space-y-4">
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
    </div>
    <h3 className="text-xl font-semibold text-slate-700">Modül Yükleniyor</h3>
    <p>Hedeflenen Çekmece Tipi: <strong className="text-blue-600">{type}</strong></p>
    {entityId && <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Kayıt ID: {entityId}</p>}
  </div>
);

export const MasterSuperDrawer = () => {
  const { drawer, closeDrawer, isVDI } = useUIStore();
  const { isOpen, type, entityId, payload } = drawer;

  // ESC ile Otonom Kapatma
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeDrawer();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeDrawer]);

  // Arka plan kaydırmasını (scroll) kilitleme
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || type === 'NONE') return null;

  // ANAYASA: Karanlık Tema Kısıtı (Sadece Gizli Soruşturmalarda Otonom Devreye Girer)
  const isStealthMode = type === 'INVESTIGATION_DETAIL';

  // Polimorfik Render Motoru
  const renderContent = () => {
    switch (type) {
      // İleride buraya gerçek componentleriniz eklenecek:
      // case 'FINDING_DETAIL': return <FindingStudioDrawer findingId={entityId} {...payload} />;
      default:
        return <PlaceholderDrawer type={type} entityId={entityId} />;
    }
  };

  return (
    <>
      {/* 🛡️ Likit Cam (Liquid Glass) Backdrop Katmanı */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] transition-all duration-500",
          isVDI ? "bg-slate-900/80" : "bg-slate-900/30 backdrop-blur-sm"
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* 🛡️ The Super Drawer Uzamsal Paneli (Ekranın %45'i) */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-screen z-[101] flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isStealthMode ? "bg-slate-950 text-slate-100 border-l border-slate-800 w-full lg:w-[60vw]" : "bg-background text-foreground border-l border-border w-full md:w-[60%] lg:w-[45%] xl:w-[40%]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Üst Bar */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          isStealthMode ? "border-slate-800 bg-slate-900/50" : "border-border bg-slate-50/50"
        )}>
          <div className="flex items-center gap-3">
            {isStealthMode && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">
              {type.replace(/_/g, ' ')} {entityId ? `| ${entityId}` : ''}
            </h2>
          </div>
          <button 
            onClick={closeDrawer}
            className={cn(
              "p-2 rounded-full transition-colors focus:outline-none focus:ring-2",
              isStealthMode ? "hover:bg-slate-800 text-slate-400 focus:ring-red-500" : "hover:bg-slate-200 text-slate-500 focus:ring-blue-500"
            )}
            title="Kapat (ESC)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dinamik İçerik Alanı */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <Suspense fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className={cn("w-8 h-8 animate-spin mb-4", isStealthMode ? "text-red-500" : "text-blue-600")} />
              <span className="text-xs tracking-widest uppercase">Modül Yükleniyor...</span>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </>
  );
};