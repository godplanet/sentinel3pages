import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  FileText, 
  Send, 
  Paperclip, 
  MessageSquare,
  ShieldAlert,
  Save,
  History
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

// --- Types ---
interface NegotiationBoardProps {
  findingId: string;
}

type TabType = 'plan' | 'chat';

// --- Mock Data (Dropdowns) ---
const RESPONSIBLE_USERS = [
  { id: 'u1', name: 'Ahmet Yılmaz (IT Manager)' },
  { id: 'u2', name: 'Ayşe Demir (Ops Lead)' },
  { id: 'u3', name: 'Mehmet Öz (CISO)' },
];

export const NegotiationBoard: React.FC<NegotiationBoardProps> = ({ findingId }) => {
  // 1. State Management
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  
  // Decision State: True = Fix (Action Plan), False = Risk Acceptance/Reject
  const [isAccepted, setIsAccepted] = useState<boolean>(true);
  
  // Form States
  const [actionPlan, setActionPlan] = useState({
    responsibleId: '',
    targetDate: '',
    steps: ''
  });
  
  const [riskAcceptance, setRiskAcceptance] = useState({
    justification: '',
    boardDecisionFile: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Handlers
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (isAccepted) {
      toast.success('Aksiyon planı kaydedildi ve denetçiye gönderildi.');
    } else {
      toast.success('Risk kabul beyanı sisteme işlendi.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 backdrop-blur-sm">
      
      {/* --- TABS --- */}
      <div className="flex border-b border-slate-200 bg-white/40">
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'plan' 
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/20" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          )}
        >
          <FileText size={16} />
          Aksiyon Planı
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'chat' 
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/20" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          )}
        >
          <MessageSquare size={16} />
          Müzakere Chat
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px]">2</span>
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
        
        <AnimatePresence mode="wait">
          {activeTab === 'plan' ? (
            <motion.div
              key="plan-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* 1. DECISION TOGGLE */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">
                  Mutabakat Kararı
                </h3>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsAccepted(true)}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                      isAccepted 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    <CheckCircle2 className="mb-1" size={24} />
                    <span className="text-sm font-bold">Bulguyu Kabul Et</span>
                    <span className="text-[10px] opacity-70">Aksiyon alacağım</span>
                  </button>

                  <button
                    onClick={() => setIsAccepted(false)}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                      !isAccepted 
                        ? "border-rose-500 bg-rose-50 text-rose-700" 
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    <ShieldAlert className="mb-1" size={24} />
                    <span className="text-sm font-bold">Risk Kabulü / İtiraz</span>
                    <span className="text-[10px] opacity-70">Aksiyon almayacağım</span>
                  </button>
                </div>
              </div>

              {/* 2. DYNAMIC FORM AREA */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                {/* Visual Indicator Line */}
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  isAccepted ? "bg-emerald-500" : "bg-rose-500"
                )} />

                {isAccepted ? (
                  // --- SCENARIO A: ACTION PLAN ---
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-emerald-700">
                      <FileText size={18} />
                      <h3 className="font-semibold">Aksiyon Planı Detayları</h3>
                    </div>

                    {/* Responsible Person */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <User size={12} /> Sorumlu Kişi
                      </label>
                      <select 
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        value={actionPlan.responsibleId}
                        onChange={(e) => setActionPlan({...actionPlan, responsibleId: e.target.value})}
                      >
                        <option value="">Seçiniz...</option>
                        {RESPONSIBLE_USERS.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <Calendar size={12} /> Termin Tarihi
                      </label>
                      <input 
                        type="date"
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        value={actionPlan.targetDate}
                        onChange={(e) => setActionPlan({...actionPlan, targetDate: e.target.value})}
                      />
                    </div>

                    {/* Action Steps */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Aksiyon Adımları</label>
                      <textarea 
                        rows={4}
                        placeholder="Bu riski bertaraf etmek için hangi adımları atacaksınız?"
                        className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                        value={actionPlan.steps}
                        onChange={(e) => setActionPlan({...actionPlan, steps: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  // --- SCENARIO B: RISK ACCEPTANCE / REJECTION ---
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-rose-700">
                      <ShieldAlert size={18} />
                      <h3 className="font-semibold">Risk Kabul / İtiraz Beyanı</h3>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-lg text-xs text-rose-800 border border-rose-100">
                      Dikkat: Riski kabul etmeniz veya bulguya itiraz etmeniz durumunda, bu kayıt <strong>Yönetim Kurulu</strong> raporuna "Düzeltilmemiş Bulgular" olarak yansıyacaktır.
                    </div>

                    {/* Justification */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Gerekçe / İtiraz Nedeni</label>
                      <textarea 
                        rows={5}
                        placeholder="Neden aksiyon alınmayacağını veya neden bulgunun hatalı olduğunu detaylandırın..."
                        className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                        value={riskAcceptance.justification}
                        onChange={(e) => setRiskAcceptance({...riskAcceptance, justification: e.target.value})}
                      />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <Paperclip size={12} /> Dayanak Belgesi / YK Kararı
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                        <span className="text-xs text-slate-400">Dosya sürükleyin veya tıklayın</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          ) : (
            // --- CHAT TAB ---
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Chat Messages (Mock) */}
              <div className="flex-1 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">AU</div>
                  <div className="flex-1">
                    <div className="bg-white p-3 rounded-lg rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-600">
                      Merhaba, 3. maddedeki kök neden analizine katılıyorum ancak termin tarihi konusunda 1 ay ek süre talep ediyoruz.
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">10:42 AM - Ahmet Yılmaz</span>
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">ME</div>
                  <div className="flex-1">
                    <div className="bg-slate-800 p-3 rounded-lg rounded-tr-none shadow-sm text-sm text-white">
                      Makul görünüyor Ahmet Bey. Aksiyon planını buna göre güncelleyip onaya sunarsanız kapatabiliriz.
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block text-right">10:45 AM - Siz</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* --- FOOTER (Actions) --- */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
        {activeTab === 'plan' ? (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold shadow-md transition-all active:scale-95",
              isAccepted 
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" 
                : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
            )}
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
            ) : (
              <Save size={16} />
            )}
            {isAccepted ? 'Kaydet ve Denetçiye Gönder' : 'Risk Beyanını Onayla'}
          </button>
        ) : (
          <div className="flex-1 flex gap-2">
            <input 
              type="text" 
              placeholder="Mesaj yazın..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};