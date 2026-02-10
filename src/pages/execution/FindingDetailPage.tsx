import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Hash, FileText, Search, Clock, User, List as ListIcon,
  Printer, Download, CheckCircle, Eye, Settings, BookOpen, Edit, Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import FindingStudioPhase3Page from './FindingStudioPhase3Page';

type RightPanelTab = 'detay' | 'tarihce' | 'ai' | 'notlar';
type ViewMode = 'zen' | 'edit' | 'studio';

export default function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('zen');
  const [warmth, setWarmth] = useState(20);
  const [rightTab, setRightTab] = useState<RightPanelTab>('detay');
  const [inspectorNotes, setInspectorNotes] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      loadFinding(id);
    } else if (id === 'new') {
      setViewMode('studio');
      setLoading(false);
    }
  }, [id]);

  const loadFinding = async (findingId: string) => {
    try {
      setLoading(true);
      const data = await comprehensiveFindingApi.getById(findingId);
      setFinding(data);
    } catch (error) {
      console.error('Failed to load finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaperColor = () => {
    const warmthValue = warmth / 100;
    const r = 255;
    const g = Math.round(255 - warmthValue * 30);
    const b = Math.round(255 - warmthValue * 60);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleTransformToFinding = () => {
    console.log('Transform notes to finding:', inspectorNotes);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log('Download PDF');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-slate-600">Bulgu yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (id === 'new' || viewMode === 'studio') {
    return <FindingStudioPhase3Page />;
  }

  if (!finding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FileText className="mx-auto text-slate-300 mb-4" size={64} />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Bulgu Bulunamadi</h2>
          <p className="text-slate-600 mb-4">Bu bulgu silinmis veya erisim izniniz yok</p>
          <button
            onClick={() => navigate('/execution/findings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Bulgu Merkezine Don
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/execution/findings')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Sentinel Studio
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('zen')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              viewMode === 'zen'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <BookOpen size={16} />
            Okuma
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              viewMode === 'edit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Edit size={16} />
            Duzenle
          </button>
          <button
            onClick={() => setViewMode('studio')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              viewMode === 'studio'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Sparkles size={16} />
            Studyo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Yazdir"
          >
            <Printer size={18} className="text-slate-600" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="PDF Indir"
          >
            <Download size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Minimal Sidebar */}
        <div className="w-16 shrink-0 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors" title="Referans">
            <Hash size={18} className="text-slate-600" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors" title="Dokuman">
            <FileText size={18} className="text-slate-600" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors" title="Ara">
            <Search size={18} className="text-slate-600" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors" title="Tarihce">
            <Clock size={18} className="text-slate-600" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors" title="Kullanici">
            <User size={18} className="text-slate-600" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors" title="Liste">
            <ListIcon size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 overflow-y-auto px-16 py-12">
          <div
            className="max-w-4xl mx-auto rounded-2xl shadow-2xl border border-slate-200 p-16"
            style={{ backgroundColor: getPaperColor() }}
          >
            {/* Workflow Stepper */}
            <div className="flex items-center justify-center gap-6 mb-12">
              <WorkflowStep label="TASLAK" active />
              <StepConnector />
              <WorkflowStep label="GOZDEN GECIRME" />
              <StepConnector />
              <WorkflowStep label="MUTABAKAT" />
              <StepConnector />
              <WorkflowStep label="TAKIP" />
              <StepConnector />
              <WorkflowStep label="KAPANIŞ" />
            </div>

            {/* Header */}
            <div className="mb-12 text-center">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                GIZLI / CONFIDENTIAL
              </div>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
                {finding.title}
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {finding.id}
                </span>
                <span className={clsx(
                  'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                  finding.severity === 'CRITICAL' && 'bg-red-600 text-white',
                  finding.severity === 'HIGH' && 'bg-orange-500 text-white',
                  finding.severity === 'MEDIUM' && 'bg-amber-500 text-white',
                  finding.severity === 'LOW' && 'bg-blue-500 text-white'
                )}>
                  {finding.severity === 'CRITICAL' ? 'KRITIK RISK' : finding.severity}
                </span>
              </div>
            </div>

            {/* AI Executive Summary */}
            {(finding.details as any)?.ai_summary && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white mb-12 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-3 opacity-90">
                      YÖNETICI ÖZETI / EXECUTIVE SUMMARY
                    </h3>
                    <p className="text-white/95 leading-relaxed italic">
                      {(finding.details as any).ai_summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Sections */}
            <div className="space-y-12">
              {/* Section 1: Criteria */}
              <ContentSection
                number="1"
                title="KRITER & MEVZUAT"
                subtitle="(ZORUNLULUK)"
              >
                <p className="text-slate-800 leading-relaxed">
                  {finding.criteria || 'BDDK Bankaların Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik, Madde 12: "Banalar varlıklara erişim, görevler ayrılığı ve çift kontrol prensiplerine göre yetkilendirilir."'}
                </p>
              </ContentSection>

              {/* Section 2: Finding */}
              <ContentSection
                number="2"
                title="TESPIT & BULGULAR"
              >
                <p className="text-slate-800 leading-relaxed mb-6">
                  {finding.detection || 'Yapılan incelemede, 12.01.2026 tarihli kasa açış işleminde şube yöneticisinin tek kişi olarak işlemi yapması tespit edilmiştir.'}
                </p>
                <p className="text-slate-700 leading-relaxed text-sm">
                  Normal prosedür gereği, Kasa Yetkilisi ve Operasyon Yöneticisi'nin birlikte olarak kasada birlikte bulunması ve kendilerine tanımlandığı anahtar/ların kendi anahtarları/na ait anahtarlarıyla kasaya yetkilendirilebilmelidir. Ancak kaydedildi, Operasyon Yöneticisi'nin kendi anlarların Kasa Yetkilisine devredildi ve işlemin tek kişi tarafından tamamlandığı gözlemlenmiştir.
                </p>
              </ContentSection>

              {/* Risk Box */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                      OPERASYONEL_RISK
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {finding.impact || 'Zimmet riski ve yasal düzenlemelere uyumsuzluk sebebiyle prosedüre ihali edilememiştir.'}
                  </p>
                </div>
                <div className="border-l-4 border-slate-400 bg-slate-50 p-6 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      FINANSAL ETKI (TAHMINI)
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {finding.financial_impact ? `${finding.financial_impact.toLocaleString('tr-TR')} TL` : '1.250.000 TL'}
                  </p>
                </div>
              </div>

              {/* Section 3: Root Cause */}
              <ContentSection
                number="3"
                title="KÖK NEDEN ANALİZİ"
              >
                <p className="text-slate-800 leading-relaxed mb-6">
                  {finding.root_cause || 'Personel sayısındaki geçici eksiklik ve eğitim arasını rotasyon planlamasının yapılmaması prosedürlerin ihial edilmesine zemin hazırlamıştır.'}
                </p>
                {finding.why_1 && (
                  <div className="bg-slate-50 rounded-lg p-6">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                      5-Whys Zincirleme Soru Analizi:
                    </h4>
                    <div className="space-y-3">
                      {finding.why_1 && <WhyItem number={1} text={finding.why_1} />}
                      {finding.why_2 && <WhyItem number={2} text={finding.why_2} />}
                      {finding.why_3 && <WhyItem number={3} text={finding.why_3} />}
                      {finding.why_4 && <WhyItem number={4} text={finding.why_4} />}
                      {finding.why_5 && <WhyItem number={5} text={finding.why_5} />}
                    </div>
                  </div>
                )}
              </ContentSection>

              {/* Section 4: Recommendation */}
              <ContentSection
                number="4"
                title="ÖNERI / GELIŞTIRME TAVSİYESİ"
              >
                <p className="text-slate-800 leading-relaxed">
                  {finding.recommendation || 'Şube sevim kadro çalışmasınızın güncellemesi ve eğitim arasın rotasyon planlamamın aynısı olmak "Nöbetçi Yetkilisi" uygulamasının sistemi olarak zorunlu hale getirilmesini önermekteyiz.'}
                </p>
              </ContentSection>

              {/* Section 5: Action Plan */}
              <ContentSection
                number="5"
                title="YÖNETİM AKSİYON PLANI"
              >
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                          SORUMLU / BIRIM / KGP
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                          MUTABAKAT
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                          AKSIYON PLANI
                        </th>
                        <th className="text-right px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                          TERMIN
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">Merkez Şube Yönetimi</div>
                          <div className="text-xs text-slate-500">Mehmet Yilmaz</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            MUTABIK
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          İlgili operasyon prosedürü Görevler Kasa Yönetimi eğitim rotasyoni eğitim rotasyon olacak şekilde yeniden güncellenecek olmadan anaacaktır.
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-slate-700">
                          15.02.2026
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">İnsan Kaynakları</div>
                          <div className="text-xs text-slate-500">Salih Kaya</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            MUTABIK
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          Personel eksikliği giderilme kadere görev güvencelememize de destek vağılacaktır.
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-slate-700">
                          01.02.2026
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ContentSection>

              {/* Sign-off Section */}
              <div className="mt-16 pt-12 border-t-2 border-slate-200">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
                      GÖZDEN GEÇIREN
                    </div>
                    <div className="border-t-2 border-slate-300 pt-4">
                      <div className="font-bold text-slate-900">Ahmet Aslan</div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">
                        BAŞDENETÇI YRD. / KIDEMLİ BAŞMUEFETTIŞ
                      </div>
                      <div className="text-xs text-blue-600 mt-2">e-imzalıdır</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
                      ONAYLAYAN
                    </div>
                    <div className="border-t-2 border-slate-300 pt-4">
                      <div className="text-slate-400 italic">İmza Beklemekte</div>
                      <div className="text-xs text-slate-500 mt-4">
                        TEFTIS KURULU BAŞKANI<br />
                        Dr. Caner Aslık
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer Footer */}
              <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 italic">
                RSENTINEL GRC - GÜVENLI DENETIM SISTEMI TARAFINDAN OLUŞTURULMUŞTUR
              </div>
            </div>
          </div>
        </div>

        {/* Right Detail Sidebar */}
        <div className="w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col">
          {/* Tabs */}
          <div className="shrink-0 flex border-b border-slate-200">
            <TabButton
              label="DETAY"
              active={rightTab === 'detay'}
              onClick={() => setRightTab('detay')}
            />
            <TabButton
              label="TARİHÇE"
              active={rightTab === 'tarihce'}
              onClick={() => setRightTab('tarihce')}
            />
            <TabButton
              label="AI"
              active={rightTab === 'ai'}
              onClick={() => setRightTab('ai')}
            />
            <TabButton
              label="NOTLAR"
              active={rightTab === 'notlar'}
              onClick={() => setRightTab('notlar')}
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {rightTab === 'detay' && (
              <DetailTab finding={finding} warmth={warmth} onWarmthChange={setWarmth} />
            )}
            {rightTab === 'tarihce' && (
              <HistoryTab />
            )}
            {rightTab === 'ai' && (
              <AITab />
            )}
            {rightTab === 'notlar' && (
              <NotesTab
                notes={inspectorNotes}
                onNotesChange={setInspectorNotes}
                onTransform={handleTransformToFinding}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors">
            <Eye size={14} />
            View
          </button>
          <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <FileText size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <Eye size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
        <div className="text-xs text-slate-400 uppercase tracking-wide">
          ROLE: <span className="text-white font-medium">Auditor Internal</span>
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={clsx(
      'flex items-center justify-center w-3 h-3 rounded-full transition-all',
      active ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'
    )}>
      <div className="absolute -bottom-6 text-[10px] font-medium text-slate-600 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

function StepConnector() {
  return <div className="w-16 h-0.5 bg-slate-300" />;
}

function ContentSection({
  number,
  title,
  subtitle,
  children
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-blue-600 font-bold text-lg">{number}.</span>
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="pl-8">
        {children}
      </div>
    </div>
  );
}

function WhyItem({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
        {number}
      </span>
      <p className="text-sm text-slate-700 leading-relaxed flex-1">{text}</p>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors',
        active
          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  );
}

function DetailTab({ finding, warmth, onWarmthChange }: {
  finding: ComprehensiveFinding;
  warmth: number;
  onWarmthChange: (v: number) => void;
}) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Author */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
          {finding.created_by_name ? getInitials(finding.created_by_name) : 'AA'}
        </div>
        <div className="font-bold text-slate-900">{finding.created_by_name || 'Ahmet Aslan'}</div>
        <div className="text-xs text-slate-500 uppercase tracking-wide">KIDEMLİ DENETÇİ</div>
        <div className="text-xs text-slate-400 mt-1">
          {new Date(finding.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Workflow Status */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
          SÜREÇ DURUMU
        </div>
        <div className="space-y-2">
          <StatusBadge label="TASLAK" active />
          <StatusBadge label="DETAY" />
          <StatusBadge label="MUTABAKAT" />
          <StatusBadge label="KAPANIŞ" />
        </div>
      </div>

      {/* Reference */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          REFERANS NO
        </div>
        <div className="font-mono text-sm text-slate-900">{finding.id}</div>
      </div>

      {/* Creation Date */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          OLUŞTURULMA
        </div>
        <div className="text-sm text-slate-700">
          {new Date(finding.created_at).toLocaleString('tr-TR')}
        </div>
      </div>

      {/* Audit Scope */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          DENETIM KAPSAMI
        </div>
        <div className="text-sm text-slate-700">
          {finding.auditee_department || '1. Çeyrek Şube Denetimleri'}
        </div>
      </div>

      {/* Warmth Slider */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
          SAYFA SICAKLIĞI
        </div>
        <input
          type="range"
          min="0"
          max="40"
          value={warmth}
          onChange={(e) => onWarmthChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Beyaz</span>
          <span className="font-mono">{warmth}</span>
          <span>Sicak</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={clsx(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
      active
        ? 'bg-blue-100 text-blue-700'
        : 'bg-slate-50 text-slate-500'
    )}>
      <div className={clsx(
        'w-2 h-2 rounded-full',
        active ? 'bg-blue-600' : 'bg-slate-300'
      )} />
      {label}
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        Tarihçe bilgileri burada görüntülenecek.
      </div>
    </div>
  );
}

function AITab() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        AI analiz bilgileri burada görüntülenecek.
      </div>
    </div>
  );
}

function NotesTab({
  notes,
  onNotesChange,
  onTransform
}: {
  notes: string;
  onNotesChange: (v: string) => void;
  onTransform: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mb-4">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notlarınız..."
          className="w-full h-full resize-none border border-slate-200 rounded-lg p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={onTransform}
        disabled={!notes.trim()}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FileText size={16} />
        Bulguya Dönüştür
      </button>
    </div>
  );
}
