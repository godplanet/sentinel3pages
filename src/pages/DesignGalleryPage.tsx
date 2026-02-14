import { useState } from 'react';

// DÜZELTME: Süslü parantez içine aldık (Named Import)
import { ZenEditor } from '@/features/finding-studio/components/ZenEditor'; 
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

export default function DesignGalleryPage() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Manken Veri (Sadece görsel test için)
  const mockData = {
    criteria: '<p><strong>Kriter:</strong> Mevzuat maddesi gereği çift onay zorunludur.</p>',
    condition: '<p><strong>Tespit:</strong> 12.02.2026 tarihinde yapılan incelemede...</p>',
    root_cause_analysis: { method: 'five_whys', five_whys: ['Personel yetersizliği', 'Eğitim eksikliği'] },
    effect: '<p>Operasyonel risk oluşmuştur.</p>',
    recommendation: '<p>Eğitimler yenilenmelidir.</p>'
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      
      {/* 1. BAŞLIK (Sayfanın çalıştığını kanıtlar) */}
      <div className="mb-6 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-slate-800">Tasarım Galerisi</h1>
           <p className="text-slate-500">Veritabanından bağımsız UI Test Ekranı</p>
        </div>
        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold border border-green-200">
          🟢 Sistem Aktif
        </div>
      </div>

      <div className="flex gap-8 h-[80vh]">
        
        {/* 2. SOL TARAFTA ZEN EDİTÖR (KİTAP GİBİ) */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 overflow-y-auto custom-scrollbar relative">
          <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Bileşen 1: ZenEditör</span>
          
          <div className="max-w-3xl mx-auto mt-8">
             {/* ZenEditor'ü çağırıyoruz - Hata olursa burası patlar */}
             <ZenEditor 
                findingId="demo" 
                initialData={mockData} 
                onChange={() => {}} 
             />
          </div>
        </div>

        {/* 3. SAĞ TARAFTA ÇEKMECE (AÇIK HALDE) */}
        <div className="w-[450px] bg-white rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden flex flex-col">
           <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <span className="font-bold text-slate-700">Bileşen 2: Evrensel Çekmece</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Universal Drawer</span>
           </div>
           
           <div className="flex-1 relative">
             {/* Çekmeceyi "zorla" render ediyoruz */}
             <UniversalFindingDrawer 
                findingId="demo"
                isOpen={true} 
                onClose={() => {}} // Kapatma fonksiyonunu boş veriyoruz ki hep açık kalsın
                defaultTab="ai"
                currentViewMode="studio"
             />
           </div>
        </div>

      </div>
    </div>
  );
}