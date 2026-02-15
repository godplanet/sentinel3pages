import React, { useState } from 'react';
import { Send, Check, X, User, Shield } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';
import { cn } from '@/lib/utils';

// Mock Data for specific component
const MOCK_MESSAGES = [
  { id: 1, sender: 'auditor', text: 'Sayın Yılmaz, bu bulgunun kök nedeni olarak "Personel Eksikliği" belirtmişsiniz. Ancak loglarda yetki aşımı görünüyor.', time: '10:30 AM' },
  { id: 2, sender: 'auditee', text: 'Haklısınız, inceledik. Bu bir yetki matrisi hatasıymış. Aksiyon planımızı revize ediyoruz.', time: '10:45 AM' },
  { id: 3, sender: 'system', type: 'proposal', text: 'Denetlenen yeni bir vade tarihi önerdi: 15 Mayıs 2026', time: '10:46 AM' }
];

export const NegotiationChat: React.FC<{ findingId: string }> = ({ findingId }) => {
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 bg-slate-900/80 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-slate-300">Canlı Müzakere</span>
        </div>
        <span className="text-xs text-slate-500">Bağlantı Güvenli (E2EE)</span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {MOCK_MESSAGES.map((msg) => {
          if (msg.type === 'proposal') {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 max-w-md text-center space-y-3">
                  <p className="text-sm text-indigo-200 font-medium">{msg.text}</p>
                  <div className="flex justify-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors text-xs font-bold border border-red-500/30">
                      <X className="h-3 w-3" /> Reddet
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition-colors text-xs font-bold border border-green-500/30">
                      <Check className="h-3 w-3" /> Onayla
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          const isAuditor = msg.sender === 'auditor';
          
          return (
            <div key={msg.id} className={cn("flex gap-4", isAuditor ? "flex-row-reverse" : "")}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border shrink-0",
                isAuditor ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" : "bg-slate-700 border-slate-600 text-slate-400"
              )}>
                {isAuditor ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              
              <div className={cn(
                "max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed",
                isAuditor 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5"
              )}>
                <p>{msg.text}</p>
                <span className={cn(
                  "text-[10px] block mt-1 opacity-70",
                  isAuditor ? "text-indigo-200" : "text-slate-500"
                )}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-white/5">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

    </div>
  );
};