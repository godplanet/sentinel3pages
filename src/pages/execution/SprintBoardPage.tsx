import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, Calendar, Users, Target } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { fetchAgileEngagement } from '@/features/audit-creation/api';
import type { AgileEngagement } from '@/features/audit-creation/types';
import { SprintBoard } from '@/widgets/SprintBoard';

export default function SprintBoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<AgileEngagement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadEngagement(id);
  }, [id]);

  const loadEngagement = async (engId: string) => {
    try {
      setLoading(true);
      const data = await fetchAgileEngagement(engId);
      setEngagement(data);
    } catch (err) {
      console.error('Failed to load engagement:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <PageHeader title="Sprint Board" icon={Target} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <PageHeader title="Sprint Board" icon={Target} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">Denetim bulunamadi</p>
            <button
              onClick={() => navigate('/execution/my-engagements')}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Denetimlere Don
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title={engagement.title}
        description={`${engagement.total_sprints} Sprint - ${engagement.status}`}
        icon={Target}
        action={
          <button
            onClick={() => navigate('/execution/my-engagements')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft size={14} /> Geri
          </button>
        }
      />

      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            {engagement.start_date} - {engagement.end_date}
          </span>
          <span className="flex items-center gap-1.5">
            <Target size={14} className="text-slate-400" />
            {engagement.total_sprints} Sprint
          </span>
          {Array.isArray(engagement.team_members) && engagement.team_members.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              {engagement.team_members.length} Denetci
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <SprintBoard engagementId={engagement.id} />
      </div>
    </div>
  );
}
