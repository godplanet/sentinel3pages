import { useState } from 'react';
// Hata riskini sıfırlamak için direkt named import deniyoruz, olmazsa default bakarız
import ZenEditor from '@/features/finding-studio/components/ZenEditor'; 
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

export default function DesignGalleryPage() {
  const [drawerOpen, setDrawerOpen] = useState(true); // Çekmeceyi açık başlatıyoruz ki görebilin

  // Sahte Veri (Sadece görsel dolu görünsün diye)
  const mockData = {
    criteria: '<h3>Kriter Alanı</h3><p>Burada mevzuat metni yazar...</p>',
    condition: '<h3>Tespit Alanı</h3><p>Burada saha bulguları yer alır...</p>',
    root_cause_analysis: { method: 'five_whys', five_whys: ['Neden 1', 'Neden 2'] },
    effect: 'Etki analizi metni',
    recommendation: 'Öneri metni'
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex gap-8">
      
      {/* SOL TARAFTA ZEN EDİTÖR (KİTAP GİBİ) */}
      <div className="flex-1 bg-white p-12 rounded-3xl shadow-xl border border-slate-200 h-[85vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b pb-4">📖 Zen Editör (Görsel Test)</h2>
        <ZenEditor 
            findingId="test" 
            initialData={mockData} 
            onChange={() => {}} 
        />
      </div>

      {/* SAĞ TARAFTA ÇEKMECEYİ "AÇIK" GÖSTERELİM */}
      {/* Normalde gizlidir ama burada görünür yapıyoruz */}
      <div className="w-[450px] bg-white rounded-3xl shadow-xl border border-slate-200 h-[85vh] relative overflow-hidden">
         <h2 className="text-xl font-bold text-slate-800 p-6 border-b bg-slate-50">🗄️ Universal Drawer</h2>
         {/* Çekmece bileşenini "zorla" render ediyoruz */}
         <UniversalFindingDrawer 
            findingId="test"
            isOpen={true} 
            onClose={() => {}}
            defaultTab="ai"
            currentViewMode="studio"
         />
      </div>

    </div>
  );
}