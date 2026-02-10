import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFinding, CreateFindingInput, FindingSeverity } from '@/entities/finding';

interface QuickFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagements: Array<{ id: string; title: string }>;
}

const TENANT_ID = '00000000-0000-0000-0000-000000000000';

export default function QuickFindingModal({
  isOpen,
  onClose,
  engagements,
}: QuickFindingModalProps) {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    engagement_id: '',
    title: '',
    severity: 'MEDIUM' as FindingSeverity,
    description: '',
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateFindingInput) => {
      const result = await createFinding(input);
      if (!result) throw new Error('Failed to create finding');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['audit-findings'] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      engagement_id: '',
      title: '',
      severity: 'MEDIUM',
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: CreateFindingInput = {
      tenant_id: TENANT_ID,
      engagement_id: formData.engagement_id,
      title: formData.title,
      severity: formData.severity,
      description: formData.description,
      finding_year: currentYear,
      state: 'DRAFT',
      status: 'DRAFT',
    };

    createMutation.mutate(input);
  };

  if (!isOpen) return null;

  const getSeverityColor = (severity: FindingSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-300 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'MEDIUM':
        return 'bg-amber-100 border-amber-300 text-amber-700';
      case 'LOW':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'OBSERVATION':
        return 'bg-slate-100 border-slate-300 text-slate-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Hızlı Bulgu Ekle</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denetim Görevi *
            </label>
            <select
              required
              value={formData.engagement_id}
              onChange={(e) => setFormData({ ...formData, engagement_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Denetim Seçin</option>
              {engagements.map((engagement) => (
                <option key={engagement.id} value={engagement.id}>
                  {engagement.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bulgu Başlığı *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Yetkilendirme Kontrollerinde Eksiklik"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Önem Derecesi *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION'] as FindingSeverity[]).map(
                (severity) => {
                  const isSelected = formData.severity === severity;
                  return (
                    <button
                      key={severity}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity })}
                      className={`
                        px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all
                        ${
                          isSelected
                            ? getSeverityColor(severity) + ' ring-2 ring-offset-2'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      {severity}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Bulgu detaylarını buraya yazın..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Not:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bulgu {currentYear} yılı için DRAFT durumunda oluşturulacak</li>
                  <li>Detaylı analiz için bulguyu daha sonra düzenleyebilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Bulgu Oluştur
                </>
              )}
            </button>
          </div>

          {createMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Bulgu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
