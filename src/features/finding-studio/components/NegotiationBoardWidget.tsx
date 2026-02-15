import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Upload, 
  Gavel, 
  FileText, 
  MessageSquare, 
  History, 
  User, 
  Calendar, 
  Plus, 
  Trash2, 
  Send,
  AlertOctagon,
  Clock
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Types ---
type DecisionType = 'accept' | 'reject';
type TabType = 'plan' | 'chat' | 'history';

interface ActionStep {
  id: string;
  description: string;
  dueDate: string;
}

interface Message {
  id: string;
  sender: 'auditor' | 'auditee' | 'system';
  content: string;
  timestamp: Date;
}

// --- Mock Data ---
const MOCK_USERS = [
  { id: 'u1', name: 'Ahmet Yılmaz (IT Manager)' },
  { id: 'u2', name: 'Ayşe Demir (Ops Lead)' },
  { id: 'u3', name: 'Mehmet Öz (CISO)' },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', sender: 'auditor', content: 'Bulgu detayındaki 3. madde kritik önem taşıyor. Aksiyon planında buna öncelik verilmeli.', timestamp: new Date(Date.now() - 86400000) },
  { id: 'm2', sender: 'auditee', content: 'Anlaşıldı, kaynak planlamasını buna göre revize ediyoruz.', timestamp: new Date(Date.now() - 82000000) },
  { id: 'm3', sender: 'system', content: 'Ahmet Yılmaz vade tarihini 15.05.2026 olarak güncelledi.', timestamp: new Date(Date.now() - 3600000) },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NegotiationBoardWidget: React.FC<{ id: string }> = ({ id }) => {
  // 1. State Management
  const [decision, setDecision] = useState<DecisionType>('accept');
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  
  // Action Plan State
  const [responsibleId, setResponsibleId] = useState('');
  const [steps, setSteps] = useState<ActionStep[]>([
    { id: 's1', description: '', dueDate: '' }
  ]);

  // Risk Acceptance State
  const [justification, setJustification] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  // 2. Handlers
  const addStep = () => {
    setSteps([...steps, { id: Math.random().toString(36).substr(2, 9), description: '', dueDate: '' }]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: keyof ActionStep, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Math.random().toString(),
      sender: 'auditee',
      content: newMessage,
      timestamp: new Date()
    }]);
    setNewMessage('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl overflow-hidden">
      
      {/* --- HEADER: DECISION SWITCH --- */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Mutabakat Kararı
        </h2>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setDecision('accept')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300",
              decision === 'accept' 
                ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm ring-1 ring-emerald-200" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <CheckCircle2 size={18} />
            <span className="text-sm">Riski Kabul Et & Çöz</span>
          </button>
          
          <button
            onClick={() => setDecision('reject')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300",
              decision === 'reject' 
                ? "bg-rose-50 text-rose-700 font-bold shadow-sm ring-1 ring-rose-200" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <ShieldAlert size={18} />
            <span className="text-sm">Riski Üstlen (Aksiyon Yok)</span>
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
        {[
          { id: 'plan', label: decision === 'accept' ? 'Aksiyon Planı' : 'Risk Beyanı', icon: FileText },
          { id: 'chat', label: 'Müzakere', icon: MessageSquare },
          { id: 'history', label: 'Tarihçe', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex-1 py-4 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 border-b-2 transition-colors",
              activeTab === tab.id 
                ? "border-slate-900 text-slate-900 bg-slate-50" 
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30">
        
        {/* SCENARIO A: ACTION PLAN (GREEN PATH) */}
        {activeTab === 'plan' && decision === 'accept' && (
          <div className="p-6 space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            
            {/* Responsible */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <User size={18} />
                <h3 className="font-bold text-sm">Sorumluluk Ataması</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sorumlu Yönetici</label>
                  <select 
                    value={responsibleId}
                    onChange={(e) => setResponsibleId(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="">Seçiniz...</option>
                    {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-emerald-700 mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  <h3 className="font-bold text-sm">Aksiyon Adımları</h3>
                </div>
                <button 
                  onClick={addStep}
                  className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <Plus size={12} /> Adım Ekle
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex gap-3 group items-start">
                    <span className="mt-3 text-xs font-mono text-slate-300 w-4">{index + 1}.</span>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        placeholder="Yapılacak işlem..." 
                        value={step.description}
                        onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-slate-200 focus:border-emerald-500 outline-none transition-all"
                      />
                      <div className="flex items-center gap-2">
                         <Calendar size={12} className="text-slate-400" />
                         <input 
                           type="date" 
                           value={step.dueDate}
                           onChange={(e) => updateStep(step.id, 'dueDate', e.target.value)}
                           className="text-xs text-slate-500 bg-transparent outline-none"
                         />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeStep(step.id)}
                      className="mt-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO B: RISK ACCEPTANCE (RED PATH) */}
        {activeTab === 'plan' && decision === 'reject' && (
          <div className="p-6 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            
            {/* Warning Box */}
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 flex items-start gap-3">
              <AlertOctagon className="text-rose-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-rose-800">Yasal Uyarı</h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  Bu işlem, belirtilen riskin kurum tarafından <strong>bilerek ve isteyerek üstlenildiğini</strong> kayıt altına alır. Bu karar, Yönetim Kurulu raporlarına "Düzeltilmemiş Kritik Bulgular" başlığı altında yansıtılacaktır.
                </p>
              </div>
            </div>

            {/* Justification Form */}
            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
              
              <div className="flex items-center gap-2 text-rose-700 mb-2">
                <Gavel size={18} />
                <h3 className="font-bold text-sm">Gerekçe ve Karar</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Hukuki / Teknik Gerekçe <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    rows={6}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                    placeholder="Risk neden kabul ediliyor? Maliyet/Fayda analizi sonucu nedir?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    YK Kararı / Kanıt Belgesi <span className="text-rose-500">*</span>
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload}
                    />
                    <Upload size={24} className="mx-auto text-slate-400 group-hover:text-rose-500 mb-2 transition-colors" />
                    {file ? (
                      <span className="text-sm font-medium text-slate-700">{file.name}</span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Dosya yüklemek için tıklayın veya sürükleyin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO C: CHAT (COMMON) */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.sender === 'auditee' ? "ml-auto items-end" : 
                    msg.sender === 'system' ? "mx-auto items-center w-full" : "items-start"
                  )}
                >
                  {msg.sender === 'system' ? (
                    <div className="bg-slate-200 text-slate-500 text-[10px] px-3 py-1 rounded-full flex items-center gap-1 my-2">
                      <Clock size={10} />
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      <div 
                        className={cn(
                          "p-3 rounded-xl text-sm shadow-sm",
                          msg.sender === 'auditee' 
                            ? "bg-indigo-600 text-white rounded-tr-none" 
                            : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {format(msg.timestamp, 'HH:mm')}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Bir mesaj yazın..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};