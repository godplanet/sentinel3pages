import { useState } from 'react';
import { Activity, Play, CheckCircle2, XCircle, AlertTriangle, Database, Users, Building2, FileText, AlertCircle, RefreshCw, Rocket } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AutoTester, type DiagnosticReport } from '@/features/diagnostics/AutoTester';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';

import { seedTurkeyBank } from '@/shared/data/seed/turkey-bank-final';

export default function DiagnosticsPage() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoCleanup, setAutoCleanup] = useState(true);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('tr-TR')}] ${message}`]);
  };

  const handleTurkeyBankSeed = async () => {
    if (!window.confirm('⚠️ DİKKAT: Veritabanına Sentinel Katılım Bankası E2E verileri yüklenecek.\n\nÖNEMLİ: Supabase SQL panelinden RLS politikalarını geçici olarak kapattığınızdan emin olun, aksi halde Sıfır Güven (Zero-Trust) kalkanı işlemi reddedecektir.\n\nOnaylıyor musunuz?')) return;

    setIsSeeding(true);
    setLogs([]);
    addLog('🚀 TÜRK BANKACILIĞI E2E SEED BAŞLATILIYOR...');
    addLog('🧬 Türk Bankacılık Ekosistemi Supabase Veritabanına İnşa Ediliyor...');

    try {
      await seedTurkeyBank();
      toast.success('Veritabanı Başarıyla Tohumlandı!', { duration: 5000 });
      addLog('✅ Türk Bankacılığı verileri Supabase\'e başarıyla yazıldı.');
      addLog('🔄 Yönlendiriliyorsunuz...');

      setTimeout(() => window.location.href = '/dashboard', 3000);
    } catch (error) {
      console.error(error);
      toast.error('Tohumlama sırasında hata oluştu!');
      addLog(`❌ Hata: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    setReport(null);
    const tester = new AutoTester();
    addLog('🤖 Sentinel Test Robotu başlatılıyor...');

    try {
      const result = await tester.runFullDiagnostics();

      result.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        addLog(`${icon} ${test.test}: ${test.status} (${test.duration}ms)`);
        if (test.error) addLog(`   └─ Hata: ${test.error}`);
      });

      setReport(result);
      addLog(`✅ Tanılama Tamamlandı: ${result.passed}/${result.totalTests} test başarılı`);

      if (autoCleanup) {
        await tester.cleanupTestData();
        addLog('🧹 Test verileri temizlendi');
      }
    } catch (error) {
      addLog(`❌ Hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full max-w-full px-8 py-8 space-y-8 bg-slate-50 min-h-screen font-sans">
      <PageHeader
        title="Sistem Test ve Tanılama"
        description="Sentinel GRC v3.0 — Uçtan Uca Otomatik Test ve Veri Kurtarma Merkezi"
        icon={Activity}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-500 rounded-xl p-6 shadow-lg flex flex-col xl:flex-row items-center justify-between gap-6"
      >
        <div>
          <h2 className="text-2xl font-black text-red-700 flex items-center gap-2">
            <Rocket className="w-8 h-8" />
            SİSTEMİ TOHUMLA (TÜRKİYE BANKASI E2E SEED)
          </h2>
          <p className="text-red-700/80 mt-2 font-medium">
            Bu buton, sistemi mock verilerden kurtarıp <strong>%100 Supabase API üzerinden</strong> gerçek Katılım Bankacılığı verisiyle (Şubeler, Riskler, Denetimler, Bulgular) doldurur.
          </p>
        </div>
        <button
          onClick={handleTurkeyBankSeed}
          disabled={isSeeding || isRunning}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-lg font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 w-full xl:w-auto"
        >
          {isSeeding ? (
            <><RefreshCw className="w-6 h-6 animate-spin" /> YÜKLENİYOR...</>
          ) : (
            <><Database className="w-6 h-6" /> GERÇEK KANI ZERK ET</>
          )}
        </button>
      </motion.div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Otomatik Test Paneli</h3>
            <p className="text-sm text-slate-500 mt-1">Sistem modüllerinin sağlık durumunu kontrol edin.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={autoCleanup}
                onChange={(e) => setAutoCleanup(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Test sonrası temizle
            </label>
            <button
              onClick={runDiagnostics}
              disabled={isRunning || isSeeding}
              className={clsx(
                'flex items-center gap-2 px-6 py-2 rounded font-medium text-white transition-colors',
                isRunning || isSeeding ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 shadow-sm'
              )}
            >
              {isRunning ? <><RefreshCw size={16} className="animate-spin" /> Çalışıyor...</> : <><Play size={16} /> Testleri Başlat</>}
            </button>
          </div>
        </div>

        <div className="bg-[#0d1117] rounded-xl p-4 font-mono text-sm h-80 overflow-y-auto border border-slate-800 shadow-inner">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic text-xs">{'// Terminal hazır. "Gerçek Kanı Zerk Et" butonuna basarak sistemi tohumlayın...'}</div>
          ) : (
            logs.map((log, idx) => {
              const isError = log.includes('❌') || log.includes('FAIL') || log.includes('Hata');
              const isWarn = log.includes('⚠️');
              const isSuccess = log.includes('✅') || log.includes('BAŞARI');
              return (
                <div key={idx} className={clsx('py-0.5 text-xs leading-relaxed', isError ? 'text-red-400' : isWarn ? 'text-amber-400' : isSuccess ? 'text-emerald-400' : 'text-slate-300')}>
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>

      {report && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            <StatCard label="Kullanıcılar" value={report.systemHealth.userCount} icon={Users} />
            <StatCard label="Birim/Şube" value={report.systemHealth.entityCount} icon={Building2} />
            <StatCard label="Denetimler" value={report.systemHealth.engagementCount} icon={FileText} />
            <StatCard label="Bulgular" value={report.systemHealth.findingCount} icon={AlertCircle} />
            <StatCard label="Ç. Kağıtları" value={report.systemHealth.workpaperCount} icon={FileText} />
            <StatCard label="Aksiyonlar" value={report.systemHealth.actionCount || 0} icon={Activity} />
          </motion.div>
        </AnimatePresence>
      )}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ResultCard title="Başarılı Modüller" count={report.passed} total={report.totalTests} icon={CheckCircle2} color="green" tests={report.tests.filter(t => t.status === 'PASS')} />
          <ResultCard title="Hatalı Modüller" count={report.failed} total={report.totalTests} icon={XCircle} color="red" tests={report.tests.filter(t => t.status === 'FAIL')} />
          <ResultCard title="Uyarılar (Mock Veri)" count={report.warned} total={report.totalTests} icon={AlertTriangle} color="amber" tests={report.tests.filter(t => t.status === 'WARN')} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col items-center justify-center text-center shadow-sm">
      <Icon size={24} className="mb-2 text-slate-400" />
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function ResultCard({
  title, count, total, icon: Icon, color, tests,
}: {
  title: string; count: number; total: number; icon: any; color: 'green' | 'red' | 'amber'; tests: any[];
}) {
  const colorClasses = {
    green: { border: 'border-emerald-200', icon: 'text-emerald-600', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    red: { border: 'border-red-200', icon: 'text-red-600', text: 'text-red-900', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
    amber: { border: 'border-amber-200', icon: 'text-amber-600', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  }[color];

  return (
    <div className={clsx('bg-white rounded-lg border p-6 shadow-sm', colorClasses.border)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon size={20} className={colorClasses.icon} />
          <h3 className={clsx('font-bold', colorClasses.text)}>{title}</h3>
        </div>
        <span className={clsx('px-2.5 py-1 rounded text-xs font-bold', colorClasses.badge)}>
          {count} / {total}
        </span>
      </div>
      {tests.length > 0 ? (
        <div className="space-y-2">
          {tests.map((test, idx) => (
            <div key={idx} className="text-sm text-slate-700 flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', colorClasses.dot)} />
              {test.test}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-400 italic">Kayıt yok.</div>
      )}
    </div>
  );
}
