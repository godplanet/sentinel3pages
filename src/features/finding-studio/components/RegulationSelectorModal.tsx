import { useState } from 'react';
import { X, Search, BookOpen, CheckCircle, Scale, FileText, Shield } from 'lucide-react';
import clsx from 'clsx';

interface Regulation {
  id: string;
  code: string;
  title: string;
  category: 'BDDK' | 'TCMB' | 'MASAK' | 'SPK' | 'KVKK' | 'DIGER';
  article?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface RegulationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (regulation: Regulation) => void;
}

const MOCK_REGULATIONS: Regulation[] = [
  {
    id: 'bddk-001',
    code: 'BDDK',
    title: 'Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik',
    category: 'BDDK',
    article: 'Madde 12 - Güvenlik Kontrolleri',
    description: 'Bankaların bilgi sistemlerinde güvenlik kontrollerini sağlaması, yedekleme ve kurtarma prosedürlerini uygulaması zorunludur.',
    severity: 'critical',
  },
  {
    id: 'bddk-002',
    code: 'BDDK',
    title: 'İç Sistemler ve İç Sermaye Değerlendirme Süreci Hakkında Yönetmelik',
    category: 'BDDK',
    article: 'Madde 8 - İç Kontrol Sistemi',
    description: 'Bankalar, risk yönetimi süreçlerini destekleyen etkin bir iç kontrol sistemi kurmak zorundadır.',
    severity: 'high',
  },
  {
    id: 'bddk-003',
    code: 'BDDK',
    title: 'Bankaların İç Denetim Fonksiyonları Hakkında Yönetmelik',
    category: 'BDDK',
    article: 'Madde 5 - Denetim Planı',
    description: 'İç denetim birimi, yıllık denetim planını risk bazlı yaklaşım ile hazırlar ve yönetim kurulunun onayına sunar.',
    severity: 'high',
  },
  {
    id: 'tcmb-001',
    code: 'TCMB',
    title: 'Ödeme ve Menkul Kıymet Mutabakat Sistemleri Hakkında Kanun',
    category: 'TCMB',
    article: 'Madde 6 - Operasyonel Risk',
    description: 'Ödeme sistemleri, operasyonel riskleri minimize edecek prosedürler ve teknolojik altyapıya sahip olmalıdır.',
    severity: 'high',
  },
  {
    id: 'tcmb-002',
    code: 'TCMB',
    title: 'Döviz İşlemleri Hakkında Tebliğ',
    category: 'TCMB',
    article: 'Madde 4 - Dokümantasyon',
    description: 'Döviz alım-satım işlemlerinde müşteri kimlik bilgileri ve işlem dokümantasyonu eksiksiz tutulmalıdır.',
    severity: 'medium',
  },
  {
    id: 'masak-001',
    code: 'MASAK',
    title: 'Suç Gelirlerinin Aklanmasının Önlenmesi Hakkında Kanun',
    category: 'MASAK',
    article: 'Madde 15 - Şüpheli İşlem Bildirimi',
    description: 'Yükümlüler, şüpheli işlemleri gecikmeksizin MASAK\'a bildirmekle yükümlüdür.',
    severity: 'critical',
  },
  {
    id: 'masak-002',
    code: 'MASAK',
    title: 'Uyum Programı Rehberi',
    category: 'MASAK',
    article: 'Bölüm 3 - Müşterini Tanı (KYC)',
    description: 'Müşteri kimlik tespiti ve doğrulaması süreçleri, risk bazlı yaklaşım ile gerçekleştirilmelidir.',
    severity: 'critical',
  },
  {
    id: 'kvkk-001',
    code: 'KVKK',
    title: 'Kişisel Verilerin Korunması Kanunu',
    category: 'KVKK',
    article: 'Madde 12 - Veri Güvenliği',
    description: 'Veri sorumlusu, kişisel verilerin hukuka aykırı işlenmesini ve erişilmesini önlemek için uygun güvenlik tedbirlerini almak zorundadır.',
    severity: 'critical',
  },
  {
    id: 'spk-001',
    code: 'SPK',
    title: 'Sermaye Piyasası Kurulu Tebliği',
    category: 'SPK',
    article: 'Madde 7 - Bilgi Güvenliği',
    description: 'Aracı kurumlar, müşteri bilgilerinin gizliliğini ve bütünlüğünü koruyacak sistemler kurmakla yükümlüdür.',
    severity: 'high',
  },
  {
    id: 'basel-001',
    code: 'BASEL III',
    title: 'Basel III Sermaye Yeterliliği Çerçevesi',
    category: 'DIGER',
    article: 'Operasyonel Risk Yönetimi',
    description: 'Bankalar, operasyonel risk için sermaye yükümlülüğü hesaplamak ve yönetmek zorundadır.',
    severity: 'high',
  },
];

const CATEGORY_CONFIG = {
  BDDK: { label: 'BDDK', color: 'blue', icon: Shield },
  TCMB: { label: 'TCMB', color: 'green', icon: Scale },
  MASAK: { label: 'MASAK', color: 'red', icon: FileText },
  SPK: { label: 'SPK', color: 'purple', icon: BookOpen },
  KVKK: { label: 'KVKK', color: 'orange', icon: Shield },
  DIGER: { label: 'Diğer', color: 'slate', icon: FileText },
};

const SEVERITY_CONFIG = {
  critical: { label: 'Kritik', color: 'red' },
  high: { label: 'Yüksek', color: 'orange' },
  medium: { label: 'Orta', color: 'yellow' },
  low: { label: 'Düşük', color: 'blue' },
};

export function RegulationSelectorModal({ isOpen, onClose, onSelect }: RegulationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredRegulations = MOCK_REGULATIONS.filter((reg) => {
    const matchesSearch =
      searchQuery === '' ||
      reg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.article?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || reg.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (regulation: Regulation) => {
    onSelect(regulation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" />
              Mevzuat Kütüphanesi
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Türk Bankacılık Sektörü Yasal Çerçevesi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mevzuat ara... (ör: 'Bilgi Sistemleri', 'KYC', 'MASAK')"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Tümü ({MOCK_REGULATIONS.length})
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
              const count = MOCK_REGULATIONS.filter((r) => r.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedCategory === key
                      ? `bg-${cfg.color}-600 text-white`
                      : `bg-${cfg.color}-100 text-${cfg.color}-700 hover:bg-${cfg.color}-200`
                  )}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Regulations List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredRegulations.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">Mevzuat bulunamadı</p>
              <p className="text-sm text-slate-400 mt-1">
                Farklı anahtar kelimeler deneyin
              </p>
            </div>
          ) : (
            filteredRegulations.map((reg) => {
              const catConfig = CATEGORY_CONFIG[reg.category];
              const sevConfig = SEVERITY_CONFIG[reg.severity];
              const Icon = catConfig.icon;

              return (
                <button
                  key={reg.id}
                  onClick={() => handleSelect(reg)}
                  className="w-full text-left border-2 border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${catConfig.color}-100 shrink-0`}>
                      <Icon className={`text-${catConfig.color}-600`} size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded bg-${catConfig.color}-100 text-${catConfig.color}-700`}
                        >
                          {catConfig.label}
                        </span>
                        {reg.article && (
                          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {reg.article}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded bg-${sevConfig.color}-100 text-${sevConfig.color}-700`}
                        >
                          {sevConfig.label}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                        {reg.title}
                      </h4>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {reg.description}
                      </p>
                    </div>

                    <CheckCircle className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" size={20} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-500 text-center">
            {filteredRegulations.length} mevzuat gösteriliyor
            {searchQuery && ` (Arama: "${searchQuery}")`}
          </p>
        </div>
      </div>
    </div>
  );
}
