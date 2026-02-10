import { useState, useEffect } from 'react';
import { X, FileWarning, AlertCircle, Target, CheckCircle2, Calendar, User } from 'lucide-react';
import clsx from 'clsx';
import { getFindingById } from '@/entities/finding/api/crud';
import type { Finding } from '@/entities/finding/model/types';

interface FindingDetailDrawerProps {
  findingId: string;
  onClose: () => void;
}

export function FindingDetailDrawer({ findingId, onClose }: FindingDetailDrawerProps) {
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinding();
  }, [findingId]);

  const loadFinding = async () => {
    setLoading(true);
    try {
      const data = await getFindingById(findingId);
      setFinding(data);
    } catch (error) {
      console.error('Error loading finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileWarning className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bulgu Detayı</h2>
              <p className="text-xs text-slate-500">Drill-Down Görünümü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-600">Bulgu yükleniyor...</p>
            </div>
          ) : finding ? (
            <>
              {/* Severity Badge */}
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border',
                    severityColors[finding.severity as keyof typeof severityColors] ||
                      severityColors.Medium
                  )}
                >
                  <AlertCircle size={16} className="mr-2" />
                  {finding.severity} Önem Seviyesi
                </div>
                <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                  {finding.status || 'DRAFT'}
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{finding.title}</h3>
                {finding.finding_ref && (
                  <p className="text-sm text-slate-500">Referans: {finding.finding_ref}</p>
                )}
              </div>

              {/* Description */}
              {finding.description && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileWarning size={16} className="text-slate-600" />
                    Bulgu Açıklaması
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{finding.description}</p>
                </div>
              )}

              {/* Root Cause */}
              {finding.root_cause && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                    <Target size={16} className="text-orange-600" />
                    Kök Neden Analizi
                  </h4>
                  <p className="text-sm text-orange-800 leading-relaxed">{finding.root_cause}</p>
                </div>
              )}

              {/* Impact */}
              {finding.impact_description && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600" />
                    Etki Değerlendirmesi
                  </h4>
                  <p className="text-sm text-red-800 leading-relaxed">
                    {finding.impact_description}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {finding.recommendation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    Öneriler
                  </h4>
                  <p className="text-sm text-green-800 leading-relaxed">{finding.recommendation}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">Ek Bilgiler</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {finding.created_at && (
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-xs">Oluşturulma</div>
                        <div className="text-slate-900 font-medium">
                          {new Date(finding.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  )}
                  {finding.target_close_date && (
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-xs">Hedef Kapanış</div>
                        <div className="text-slate-900 font-medium">
                          {new Date(finding.target_close_date).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  )}
                  {finding.assigned_to_name && (
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-xs">Sorumlu</div>
                        <div className="text-slate-900 font-medium">{finding.assigned_to_name}</div>
                      </div>
                    </div>
                  )}
                  {finding.state && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-xs">Durum</div>
                        <div className="text-slate-900 font-medium">{finding.state}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* GIAS Details */}
              {finding.details && Object.keys(finding.details).length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">GIAS 2024 Detayları</h4>
                  <div className="space-y-2 text-xs">
                    {Object.entries(finding.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-blue-700 capitalize">{key}:</span>
                        <span className="text-blue-900 font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <FileWarning className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Bulgu bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
