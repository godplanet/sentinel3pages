import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import { comprehensiveFindingApi, actionPlanApi, findingCommentsApi, auditeePortalApi } from '@/entities/finding/api/module5-api';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';
import {
  FileText,
  AlertTriangle,
  Calendar,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  Loader2,
  Clock,
  ArrowLeft,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  HIGH: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  LOW: { label: 'Low', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
  OBSERVATION: { label: 'Observation', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
};

export function AuditeePortalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Action Plan Form
  const [actionPlanForm, setActionPlanForm] = useState({
    title: '',
    description: '',
    responsible_person: '',
    responsible_person_title: '',
    responsible_department: '',
    target_date: '',
    priority: 'MEDIUM' as const,
  });

  // Comment Form
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      loadFinding();
    }
  }, [id]);

  const loadFinding = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await comprehensiveFindingApi.getById(id);
      setFinding(data);
    } catch (error) {
      console.error('Failed to load finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);

      const response = await auditeePortalApi.submitResponse(
        id,
        actionPlanForm,
        comment || undefined
      );

      await loadFinding();

      setActionPlanForm({
        title: '',
        description: '',
        responsible_person: '',
        responsible_person_title: '',
        responsible_department: '',
        target_date: '',
        priority: 'MEDIUM',
      });
      setComment('');

      alert('Response submitted successfully!');
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-600">Loading finding...</p>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-lg text-slate-900 font-semibold">Finding not found</p>
          <button
            onClick={() => navigate('/auditee-portal')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  const severityConfig = SEVERITY_CONFIG[finding.severity];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Auditee Portal"
        subtitle="Review finding and submit action plan"
        icon={FileText}
        actions={
          <button
            onClick={() => navigate('/auditee-portal')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to My Findings</span>
          </button>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* LEFT PANEL: Finding Details (Read-Only Glass Card) */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-lg border border-slate-200/50 shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block mb-2">
                    {finding.finding_code || finding.code}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{finding.title}</h2>
                  {finding.gias_category && (
                    <p className="text-sm text-slate-600 mt-1">{finding.gias_category}</p>
                  )}
                </div>
                <span
                  className={`
                    inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2
                    ${severityConfig.bgColor} ${severityConfig.color} ${severityConfig.borderColor}
                  `}
                >
                  <AlertTriangle size={14} className="mr-1.5" />
                  {severityConfig.label}
                </span>
              </div>

              <div className="space-y-4">
                {finding.description_public && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                    <div
                      className="prose prose-sm max-w-none text-slate-600"
                      dangerouslySetInnerHTML={{ __html: finding.description_public }}
                    />
                  </div>
                )}

                {finding.description && !finding.description_public && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Finding Details</h3>
                    <p className="text-sm text-slate-600">{finding.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Risk Rating</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {finding.risk_rating || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Published Date</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {finding.published_at
                        ? new Date(finding.published_at).toLocaleDateString()
                        : 'Not published'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Action Plans */}
            {finding.action_plans && finding.action_plans.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-lg border border-slate-200/50 shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  Submitted Action Plans
                </h3>

                <div className="space-y-4">
                  {finding.action_plans.map((plan) => (
                    <div key={plan.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{plan.title}</h4>
                        <span
                          className={`
                            text-xs px-2 py-1 rounded font-medium
                            ${plan.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              plan.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'}
                          `}
                        >
                          {plan.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{plan.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-slate-500">Responsible Person</div>
                          <div className="font-medium text-slate-900">{plan.responsible_person}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Target Date</div>
                          <div className="font-medium text-slate-900">
                            {new Date(plan.target_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Thread */}
            {finding.comments && finding.comments.filter(c => !c.is_deleted).length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-lg border border-slate-200/50 shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} className="text-blue-600" />
                  Discussion Thread
                </h3>

                <div className="space-y-3">
                  {finding.comments
                    .filter((c) => !c.is_deleted)
                    .map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-lg ${
                          comment.author_role === 'AUDITOR'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                comment.author_role === 'AUDITOR'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-600 text-white'
                              }`}
                            >
                              {comment.author_role[0]}
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                              {comment.author_name || comment.author_role}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.comment_text}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Action Plan Form (Solid Background for Readability) */}
          <div>
            <form onSubmit={handleSubmitResponse} className="bg-white rounded-lg border border-slate-200 shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Send size={20} className="text-blue-600" />
                Submit Action Plan
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Action Plan Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={actionPlanForm.title}
                    onChange={(e) => setActionPlanForm({ ...actionPlanForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Brief title for the action plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    value={actionPlanForm.description}
                    onChange={(e) => setActionPlanForm({ ...actionPlanForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Describe the corrective actions you will take..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Responsible Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={actionPlanForm.responsible_person}
                    onChange={(e) => setActionPlanForm({ ...actionPlanForm, responsible_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Name of person responsible"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={actionPlanForm.responsible_person_title}
                      onChange={(e) =>
                        setActionPlanForm({ ...actionPlanForm, responsible_person_title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Job title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={actionPlanForm.responsible_department}
                      onChange={(e) =>
                        setActionPlanForm({ ...actionPlanForm, responsible_department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Department"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Target Completion Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={actionPlanForm.target_date}
                      onChange={(e) => setActionPlanForm({ ...actionPlanForm, target_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select
                      value={actionPlanForm.priority}
                      onChange={(e) =>
                        setActionPlanForm({ ...actionPlanForm, priority: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Any additional information or questions for the auditor..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Action Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Important</h4>
                  <p className="text-sm text-blue-700">
                    Your action plan will be reviewed by the auditor. Please provide detailed information
                    about corrective actions and realistic timelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
