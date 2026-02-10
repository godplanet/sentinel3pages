import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findingApi, assignmentApi, actionStepApi, type FindingWithAssignment, type ActionStep } from '@/entities/finding';
import { CheckCircle2, XCircle, Plus, Trash2, Save, ArrowLeft, AlertCircle } from 'lucide-react';

export function AuditeePortalWidget() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [finding, setFinding] = useState<FindingWithAssignment | null>(null);
  const [actionSteps, setActionSteps] = useState<Partial<ActionStep>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentStep, setCurrentStep] = useState<'review' | 'action' | 'approval'>('review');
  const [responseType, setResponseType] = useState<'AGREED' | 'DISAGREED' | null>(null);
  const [rootCause, setRootCause] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (id) {
      loadFinding();
    }
  }, [id]);

  async function loadFinding() {
    setIsLoading(true);
    try {
      const data = await findingApi.getById(id!);
      setFinding(data);

      if (data?.assignment) {
        setResponseType(data.assignment.portal_status === 'DISAGREED' ? 'DISAGREED' :
                       data.assignment.portal_status === 'AGREED' ? 'AGREED' : null);
        setRootCause(data.assignment.auditee_opinion || '');
        setRejectionReason(data.assignment.rejection_reason || '');

        const steps = await actionStepApi.getByAssignment(data.assignment.id);
        setActionSteps(steps.map(s => ({
          description: s.description,
          due_date: s.due_date,
          status: s.status,
        })));

        if (data.assignment.portal_status !== 'PENDING') {
          setCurrentStep('approval');
        }
      }
    } catch (error) {
      console.error('Failed to load finding:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function addActionStep() {
    setActionSteps([
      ...actionSteps,
      {
        description: '',
        due_date: '',
        status: 'OPEN',
      },
    ]);
  }

  function removeActionStep(index: number) {
    setActionSteps(actionSteps.filter((_, i) => i !== index));
  }

  function updateActionStep(index: number, field: string, value: string) {
    const updated = [...actionSteps];
    updated[index] = { ...updated[index], [field]: value };
    setActionSteps(updated);
  }

  async function handleSubmit() {
    if (!finding?.assignment || !responseType) return;

    setIsSubmitting(true);
    try {
      await assignmentApi.update(finding.assignment.id, {
        portal_status: responseType,
        auditee_opinion: rootCause,
        rejection_reason: responseType === 'DISAGREED' ? rejectionReason : undefined,
      });

      if (responseType === 'AGREED') {
        for (const step of actionSteps) {
          if (step.description && step.due_date) {
            await actionStepApi.create({
              assignment_id: finding.assignment.id,
              description: step.description,
              due_date: step.due_date,
              status: 'OPEN',
            });
          }
        }
      }

      navigate('/auditee-portal');
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Yanıt gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!finding || !finding.assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <div className="text-slate-500">Bulgu bulunamadı</div>
        <button
          onClick={() => navigate('/auditee-portal')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Atamalarıma Dön
        </button>
      </div>
    );
  }

  const isLocked = finding.assignment.is_locked;
  const severityColors = {
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-blue-100 text-blue-800',
  };

  const severityLabels = {
    CRITICAL: 'Kritik',
    HIGH: 'Yüksek',
    MEDIUM: 'Orta',
    LOW: 'Düşük',
  };

  const workflowSteps = [
    { key: 'review', label: 'İnceleme', completed: currentStep !== 'review' },
    { key: 'action', label: 'Aksiyon', completed: currentStep === 'approval' },
    { key: 'approval', label: 'Onay', completed: false },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/auditee-portal')}
        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-white rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Atamalarıma Dön
      </button>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded border border-slate-200">
                  {finding.code}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded ${severityColors[finding.severity]}`}>
                  {severityLabels[finding.severity]}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{finding.title}</h1>
            </div>

            <div className="p-8 space-y-8 bg-white" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #fefefe 100%)' }}>
              {finding.criteria_json && finding.criteria_json.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b-2 border-slate-200 pb-2">
                    <span className="w-1 h-6 bg-blue-600 rounded" />
                    Yasal Dayanak
                  </h2>
                  <div className="pl-4 space-y-2">
                    {finding.criteria_json.map((criterion: any, index: number) => (
                      <div key={index} className="text-sm text-slate-700 bg-blue-50 p-3 rounded border-l-4 border-blue-600">
                        {criterion.text || criterion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finding.detection_html && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b-2 border-slate-200 pb-2">
                    <span className="w-1 h-6 bg-red-600 rounded" />
                    Tespit
                  </h2>
                  <div
                    className="pl-4 prose prose-sm max-w-none text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: finding.detection_html }}
                  />
                </div>
              )}

              {finding.impact_html && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b-2 border-slate-200 pb-2">
                    <span className="w-1 h-6 bg-orange-600 rounded" />
                    Etki
                  </h2>
                  <div
                    className="pl-4 prose prose-sm max-w-none text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: finding.impact_html }}
                  />
                </div>
              )}

              {finding.recommendation_html && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b-2 border-slate-200 pb-2">
                    <span className="w-1 h-6 bg-green-600 rounded" />
                    Öneri
                  </h2>
                  <div
                    className="pl-4 prose prose-sm max-w-none text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: finding.recommendation_html }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="sticky top-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Çalışma Alanı</h3>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  {workflowSteps.map((step, index) => (
                    <div key={step.key} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            step.completed
                              ? 'bg-green-500 text-white'
                              : currentStep === step.key
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {step.completed ? '✓' : index + 1}
                        </div>
                        <div className="text-xs mt-1 text-slate-600 text-center">{step.label}</div>
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <div
                          className={`w-12 h-0.5 mx-2 ${
                            step.completed ? 'bg-green-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {currentStep === 'review' && !isLocked && (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-700 mb-4">
                      Bulguyu inceleyin ve kararınızı verin:
                    </div>

                    <button
                      onClick={() => {
                        setResponseType('AGREED');
                        setCurrentStep('action');
                      }}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg border-2 transition-all ${
                        responseType === 'AGREED'
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-green-300'
                      }`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-semibold text-lg">Kabul Ediyorum</span>
                    </button>

                    <button
                      onClick={() => {
                        setResponseType('DISAGREED');
                        setCurrentStep('action');
                      }}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg border-2 transition-all ${
                        responseType === 'DISAGREED'
                          ? 'bg-red-50 border-red-500 text-red-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-red-300'
                      }`}
                    >
                      <XCircle className="w-6 h-6" />
                      <span className="font-semibold text-lg">Kabul Etmiyorum</span>
                    </button>
                  </div>
                )}

                {currentStep === 'action' && !isLocked && (
                  <div className="space-y-4">
                    {responseType === 'AGREED' ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Kök Neden Görüşünüz
                          </label>
                          <textarea
                            required
                            value={rootCause}
                            onChange={(e) => setRootCause(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Bulgunun kök nedeni hakkındaki görüşünüz..."
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">Aksiyon Planı</label>
                            <button
                              type="button"
                              onClick={addActionStep}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              Ekle
                            </button>
                          </div>

                          {actionSteps.length === 0 ? (
                            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-dashed border-slate-300 text-center">
                              Aksiyon adımı ekleyin
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {actionSteps.map((step, index) => (
                                <div key={index} className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <input
                                      type="text"
                                      required
                                      value={step.description || ''}
                                      onChange={(e) => updateActionStep(index, 'description', e.target.value)}
                                      placeholder="Aksiyon..."
                                      className="flex-1 px-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeActionStep(index)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <input
                                    type="date"
                                    required
                                    value={step.due_date || ''}
                                    onChange={(e) => updateActionStep(index, 'due_date', e.target.value)}
                                    className="w-full px-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setCurrentStep('approval')}
                          disabled={!rootCause || actionSteps.length === 0}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          İleri
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Görüşünüz</label>
                          <textarea
                            required
                            value={rootCause}
                            onChange={(e) => setRootCause(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Bulgu hakkındaki görüşünüz..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Red Gerekçesi</label>
                          <textarea
                            required
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Neden kabul etmediğinizi açıklayın..."
                          />
                        </div>

                        <button
                          onClick={() => setCurrentStep('approval')}
                          disabled={!rootCause || !rejectionReason}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          İleri
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setCurrentStep('review')}
                      className="w-full px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Geri
                    </button>
                  </div>
                )}

                {currentStep === 'approval' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        {responseType === 'AGREED' ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">Kabul Edildi</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-700">
                            <XCircle className="w-5 h-5" />
                            <span className="font-semibold">Reddedildi</span>
                          </div>
                        )}
                      </div>

                      {responseType === 'AGREED' && (
                        <div className="text-xs text-slate-600">
                          <div className="font-medium mb-1">Aksiyon Sayısı:</div>
                          <div>{actionSteps.length} adım planlandı</div>
                        </div>
                      )}
                    </div>

                    {!isLocked ? (
                      <>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
                        >
                          <Save className="w-5 h-5" />
                          {isSubmitting ? 'Gönderiliyor...' : 'Onayla ve Gönder'}
                        </button>

                        <button
                          onClick={() => setCurrentStep('action')}
                          className="w-full px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Geri
                        </button>
                      </>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                        Bu yanıt kilitlenmiştir ve değiştirilemez.
                      </div>
                    )}
                  </div>
                )}

                {isLocked && (
                  <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-sm text-slate-700">
                    <div className="font-semibold mb-2">Gönderilmiş Yanıt</div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium">Durum:</span>{' '}
                        {finding.assignment.portal_status === 'AGREED' ? 'Kabul Edildi' : 'Reddedildi'}
                      </div>
                      {rootCause && (
                        <div>
                          <span className="font-medium">Görüş:</span> {rootCause}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
