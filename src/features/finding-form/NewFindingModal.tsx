import { useState } from 'react';
import { X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import type { FindingSeverity, GIASCategory } from '@/entities/finding/model/types';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';

interface NewFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: any) => void;
}

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

export const NewFindingModal = ({ isOpen, onClose, onSave }: NewFindingModalProps) => {
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    severity: 'MEDIUM' as FindingSeverity,
    gias_category: '' as GIASCategory | '',
    auditee_department: '',

    detection: '', // Tespit
    impact: '',    // Etki
    root_cause: '', // Kök Neden Özeti
    recommendation: '', // Öneri

    impact_score: 3,
    likelihood_score: 3,
    financial_impact: 0,

    // 5-Whys
    why_1: '',
    why_2: '',
    why_3: '',
    why_4: '',
    why_5: '',
  });

  const sections = [
    { id: 'tespit' as const, label: 'Tespit', icon: FileSearch, color: 'blue' },
    { id: 'risk' as const, label: 'Risk & Etki', icon: TrendingUp, color: 'orange' },
    { id: 'koken' as const, label: 'Kök Neden', icon: AlertTriangle, color: 'red' },
    { id: 'oneri' as const, label: 'Öneri', icon: Lightbulb, color: 'green' },
  ];

  const handleSave = async () => {
    // 1. Validasyon
    if (!formData.title.trim()) {
      toast.error('Lütfen bulgu başlığı giriniz.');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Lütfen referans no giriniz.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. API Payload Hazırlığı
      // Form verilerini API'nin beklediği formata dönüştürüyoruz
      const payload = {
        title: formData.title,
        severity: formData.severity,
        status: 'DRAFT', // Varsayılan taslak
        category: 'Audit',
        engagement_id: 'GENERAL_AUDIT', // Veya context'ten gelen ID
        
        // Ana Metin Alanları
        description: formData.detection, // 'Tespit' alanını description olarak kullanıyoruz
        criteria: formData.code, // Referans kodunu kriter/kod alanına
        
        // Detaylı Veriler (JSONB alanları için)
        details: {
          gias_category: formData.gias_category,
          auditee_department: formData.auditee_department,
          impact_text: formData.impact,
          recommendation_text: formData.recommendation,
          financial_impact: formData.financial_impact,
          risk_scores: {
            impact: formData.impact_score,
            likelihood: formData.likelihood_score,
            total: formData.impact_score * formData.likelihood_score
          },
          root_cause_analysis: {
            summary: formData.root_cause,
            method: '5-Whys',
            whys: [
              formData.why_1,
              formData.why_2,
              formData.why_3,
              formData.why_4,
              formData.why_5
            ].filter(w => w) // Boş olanları filtrele
          }
        }
      };

      // 3. API Çağrısı
      await comprehensiveFindingApi.create(payload);

      // 4. Başarı İşlemleri
      toast.success('Bulgu başarıyla kaydedildi!');
      
      // Parent bileşeni bilgilendir (Listeyi yenilemesi için)
      onSave(payload);
      
      // Modalı kapat ve formu temizle
      onClose();
      
    } catch (error) {
      console.error('Kayıt hatası:', error);
      toast.error('Bulgu kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Yeni Bulgu Oluştur</h2>
              <p className="text-sm text-gray-600 mt-1">
                Tespit edilen bulguyu detaylı olarak kaydedin
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulgu Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Örn: Kasa İşlemlerinde Çift Anahtar Kuralı İhlali"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referans No *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-mono"
                    placeholder="AUD-2025-SR-XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Önem Seviyesi *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value as FindingSeverity })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="CRITICAL">Kritik</option>
                    <option value="HIGH">Yüksek</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="LOW">Düşük</option>
                    <option value="OBSERVATION">Gözlem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GIAS Kategorisi
                  </label>
                  <select
                    value={formData.gias_category}
                    onChange={(e) =>
                      setFormData({ ...formData, gias_category: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Operasyonel Risk">Operasyonel Risk</option>
                    <option value="Uyum Riski">Uyum Riski</option>
                    <option value="Finansal Risk">Finansal Risk</option>
                    <option value="Teknolojik Risk">Teknolojik Risk</option>
                    <option value="Yönetişim">Yönetişim</option>
                    <option value="İç Kontrol">İç Kontrol</option>
                    <option value="Risk Yönetimi">Risk Yönetimi</option>
                    <option value="BT Güvenliği">BT Güvenliği</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sorumlu Birim
                  </label>
                  <input
                    type="text"
                    value={formData.auditee_department}
                    onChange={(e) =>
                      setFormData({ ...formData, auditee_department: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Örn: Şube Müdürlüğü"
                  />
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-2 mb-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all',
                      activeSection === section.id
                        ? `bg-${section.color}-600 text-white shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              {/* TESPİT */}
              {activeSection === 'tespit' && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileSearch className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Tespit</h3>
                      <p className="text-sm text-blue-700">Bulgunun detaylı açıklaması</p>
                    </div>
                  </div>
                  <textarea
                    value={formData.detection}
                    onChange={(e) => setFormData({ ...formData, detection: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                    rows={12}
                    placeholder="Yapılan inceleme sonucunda tespit edilen bulguyu detaylı olarak açıklayın..."
                  />
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI ile İyileştir
                  </button>
                </div>
              )}

              {/* RİSK & ETKİ */}
              {activeSection === 'risk' && (
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900">Risk & Etki</h3>
                      <p className="text-sm text-orange-700">
                        Bulgunun risk değerlendirmesi ve etkisi
                      </p>
                    </div>
                  </div>

                  {/* Risk Skorları */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-2">
                        Etki Skoru (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.impact_score}
                        onChange={(e) =>
                          setFormData({ ...formData, impact_score: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-2">
                        Olasılık Skoru (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.likelihood_score}
                        onChange={(e) =>
                          setFormData({ ...formData, likelihood_score: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-orange-900 mb-2">
                        Finansal Etki (TL)
                      </label>
                      <input
                        type="number"
                        value={formData.financial_impact}
                        onChange={(e) =>
                          setFormData({ ...formData, financial_impact: parseFloat(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <textarea
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white"
                    rows={10}
                    placeholder="Bulgunun organizasyon üzerindeki risk ve etkisini detaylı olarak açıklayın..."
                  />
                </div>
              )}

              {/* KÖK NEDEN ANALİZİ (5-WHYS) */}
              {activeSection === 'koken' && (
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">Kök Neden Analizi</h3>
                      <p className="text-sm text-red-700">5-Whys metodu ile kök neden tespiti</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm mt-2">
                          {num}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-red-900 mb-2">
                            Neden {num} - Neden?
                          </label>
                          <input
                            type="text"
                            value={formData[`why_${num}` as keyof typeof formData] as string}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`why_${num}`]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            placeholder={`${num}. nedenin açıklaması...`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-red-100 border-l-4 border-red-600 p-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Kök Neden Özeti</h4>
                    <textarea
                      value={formData.root_cause}
                      onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                      className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white"
                      rows={3}
                      placeholder="5-Whys analizi sonucu belirlenen kök nedeni özetleyin..."
                    />
                  </div>
                </div>
              )}

              {/* ÖNERİ */}
              {activeSection === 'oneri' && (
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Öneri</h3>
                      <p className="text-sm text-green-700">
                        İyileştirme ve düzeltici aksiyon önerileri
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={formData.recommendation}
                    onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white"
                    rows={12}
                    placeholder="Bulgunun düzeltilmesi ve gelecekte tekrarlanmaması için önerilerinizi yazın..."
                  />
                  <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Öneri Oluştur
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              İptal
            </button>
            <div className="flex gap-3">
              <button 
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                Taslak Olarak Kaydet
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Bulguyu Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};