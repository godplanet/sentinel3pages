import { useState } from 'react';
import { Save, GitMerge, UserCheck, ShieldAlert } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';

export default function WorkflowSettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">İş Akışı ve Onay Parametreleri</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bulgu Onay Zinciri */}
        <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><GitMerge size={20}/></div>
                <h3 className="font-bold text-slate-800">Bulgu Onay Hiyerarşisi</h3>
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase">Düşük / Orta Risk</span>
                        <span className="font-bold text-slate-800">Kıdemli Denetçi Onayı Yeterli</span>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase">Yüksek / Kritik Risk</span>
                        <span className="font-bold text-slate-800">Başdenetçi + Yönetici Onayı Şart</span>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                </div>
            </div>
        </GlassCard>

        {/* Risk Kabul Yetkisi */}
        <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ShieldAlert size={20}/></div>
                <h3 className="font-bold text-slate-800">Risk Kabul Yetkisi</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Operasyonel Riskler (Max 1M TL)</label>
                    <select className="w-full p-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-700">
                        <option>Birim Müdürü</option>
                        <option>Grup Müdürü</option>
                        <option>Genel Müdür Yrd.</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Kritik Riskler (> 1M TL)</label>
                    <select className="w-full p-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-700">
                        <option>Yönetim Kurulu</option>
                        <option>Denetim Komitesi</option>
                    </select>
                </div>
            </div>
        </GlassCard>

      </div>
      
      <div className="mt-8 flex justify-end">
          <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800">
              <Save size={18}/> Ayarları Kaydet
          </button>
      </div>
    </div>
  );
}