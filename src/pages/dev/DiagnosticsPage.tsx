import { useState } from 'react';
import { Activity, Play, CheckCircle2, XCircle, AlertTriangle, Database, Users, Building2, FileText, AlertCircle, Wrench, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AutoTester, type DiagnosticReport } from '@/features/diagnostics/AutoTester';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const SEED_MANAGER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-manager`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function callSeedManager(path: string, method: 'GET' | 'POST' = 'POST') {
  const res = await fetch(`${SEED_MANAGER_URL}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge function error (${res.status}): ${text}`);
  }
  return res.json();
}

export default function DiagnosticsPage() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [seedCounts, setSeedCounts] = useState<Record<string, number> | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('tr-TR')}] ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    setReport(null);

    const tester = new AutoTester();

    addLog('🤖 Sentinel Test Robotu başlatılıyor...');
    addLog('📋 Sistem tanılama çalıştırılıyor...');

    try {
      const result = await tester.runFullDiagnostics();

      if (result.selfHealed) {
        addLog('🧬 BİLGİ: Veritabanı boştu. Katılım Bankası verileri otomatik yüklendi.');
      }

      result.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        addLog(`${icon} ${test.test}: ${test.status} (${test.duration}ms)`);
        if (test.error) {
          addLog(`   └─ Hata: ${test.error}`);
        }
      });

      setReport(result);
      addLog(`✅ Tanılama Tamamlandı: ${result.passed}/${result.totalTests} test başarılı`);

      if (autoCleanup) {
        addLog('🧹 Test verileri temizleniyor...');
        await tester.cleanupTestData();
        addLog('✅ Temizlik tamamlandı');
      }
    } catch (error) {
      addLog(`❌ Hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleForceReseed = async () => {
    if (!window.confirm(
      '⚠️ DİKKAT: Bu işlem mevcut tüm verilerinizi SİLECEK ve Katılım Bankası demo verilerini yeniden yükleyecektir. Emin misiniz?'
    )) return;

    setIsReseeding(true);
    setLogs([]);
    setReport(null);
    setSeedCounts(null);

    addLog('🚀 SIFIRLAMA BAŞLIYOR — Veritabanı siliniyor ve yeniden yükleniyor...');
    addLog('📡 Sentinel Edge Function çağrılıyor (seed-manager/reseed)...');

    try {
      const result = await callSeedManager('reseed', 'POST');

      if (result.wipeLog?.length) {
        addLog('🗑️  Silme Adımları:');
        result.wipeLog.forEach((line: string) => addLog(`   ${line}`));
      }

      if (result.seedLog?.length) {
        addLog('🌱 Yükleme Adımları:');
        result.seedLog.forEach((line: string) => {
          const isOk = line.startsWith('OK');
          const isFail = line.startsWith('FAIL');
          addLog(`   ${isOk ? '✅' : isFail ? '❌' : '•'} ${line}`);
        });
      }

      if (result.counts) {
        setSeedCounts(result.counts);
        const total = Object.values(result.counts as Record<string, number>).reduce(
          (s, v) => s + (v > 0 ? v : 0), 0
        );
        addLog(`📊 Yükleme tamamlandı — toplam ${total} kayıt veritabanına yazıldı.`);
      }

      addLog('✅ Veritabanı başarıyla sıfırlandı ve demo veriler yüklendi!');
      addLog('🔄 Sayfa 3 saniye içinde yenilenecek...');

      setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      addLog(`❌ Edge Function Hatası: ${error instanceof Error ? error.message : String(error)}`);
      addLog('💡 İpucu: Supabase edge function\'ının deploy edildiğinden emin olun.');
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="w-full max-w-full px-8 py-8 space-y-8 bg-slate-50 min-h-screen font-sans">
      <PageHeader
        title="Sistem Test ve Tanılama"
        description="Sentinel GRC v3.0 — Uçtan Uca Otomatik Test ve Veri Kurtarma Merkezi"
        icon={Activity}
      />

      {report && report.systemHealth.userCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-l-4 border-red-500 rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">⚠️ SİSTEMDE VERİ YOK</h3>
              <p className="text-sm text-slate-600 mb-4">
                Veritabanı boş. Testlerin ve sayfaların çalışması için demo verilerini yükleyin.
              </p>
              <button
                onClick={handleForceReseed}
                disabled={isReseeding}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors shadow-sm disabled:opacity-60"
              >
                <Wrench size={18} />
                {isReseeding ? 'Yükleniyor...' : 'Sistemi Kur (Demo Verilerini Yükle)'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Operasyon Paneli</h3>
            <p className="text-sm text-slate-500 mt-1">
              Sistemi otomatik test edin veya demo verilerini sıfırlayın. Farklı bilgisayarlardan test için "Sıfırla ve Yükle" kullanın.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={autoCleanup}
                onChange={(e) => setAutoCleanup(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Test sonrası veriyi temizle
            </label>
            <button
              onClick={handleForceReseed}
              disabled={isReseeding || isRunning}
              title="Veritabanını sıfırla ve tüm demo verileri yeniden yükle (farklı kullanıcılar/bilgisayarlar için)"
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors border',
                isReseeding || isRunning
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300',
              )}
            >
              {isReseeding
                ? <><RefreshCw size={16} className="animate-spin" /> Yükleniyor...</>
                : <><Wrench size={16} /> Sıfırla &amp; Yükle</>}
            </button>
            <button
              onClick={runDiagnostics}
              disabled={isRunning || isReseeding}
              className={clsx(
                'flex items-center gap-2 px-6 py-2 rounded font-medium text-white transition-colors',
                isRunning || isReseeding
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm',
              )}
            >
              {isRunning
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Test Çalışıyor...</>
                : <><Play size={16} /> Testleri Başlat</>}
            </button>
          </div>
        </div>

        <div className="bg-[#0d1117] rounded-xl p-4 font-mono text-sm h-80 overflow-y-auto border border-slate-800 shadow-inner">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic text-xs">
              {'// Terminal hazır. "Sıfırla & Yükle" veya "Testleri Başlat" butonuna basın...'}
            </div>
          ) : (
            logs.map((log, idx) => {
              const isError = log.includes('❌') || log.includes('FAIL') || log.includes('Hata');
              const isWarn = log.includes('⚠️') || log.includes('skipped');
              const isSuccess = log.includes('✅');
              return (
                <div
                  key={idx}
                  className={clsx(
                    'py-0.5 text-xs leading-relaxed',
                    isError ? 'text-red-400' : isWarn ? 'text-amber-400' : isSuccess ? 'text-emerald-400' : 'text-slate-300',
                  )}
                >
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
        {seedCounts && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg border border-emerald-200 shadow-sm p-6"
          >
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Database size={16} className="text-emerald-600" />
              Yüklenen Veri Özeti
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(seedCounts)
                .filter(([, v]) => v > 0)
                .map(([table, count]) => (
                  <div key={table} className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <div className="text-xl font-bold text-slate-900">{count}</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5 truncate">{table.replace(/_/g, ' ')}</div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Tenant" value={report.systemHealth.tenantCount} icon={Database} />
            <StatCard label="Kullanıcılar" value={report.systemHealth.userCount} icon={Users} />
            <StatCard label="Birim/Şube" value={report.systemHealth.entityCount} icon={Building2} />
            <StatCard label="Denetimler" value={report.systemHealth.engagementCount} icon={FileText} />
            <StatCard label="Bulgular" value={report.systemHealth.findingCount} icon={AlertCircle} />
            <StatCard label="Ç. Kağıtları" value={report.systemHealth.workpaperCount} icon={FileText} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ResultCard title="Başarılı Modüller" count={report.passed} total={report.totalTests} icon={CheckCircle2} color="green" tests={report.tests.filter(t => t.status === 'PASS')} />
            <ResultCard title="Hatalı Modüller" count={report.failed} total={report.totalTests} icon={XCircle} color="red" tests={report.tests.filter(t => t.status === 'FAIL')} />
            <ResultCard title="Uyarılar (Mock Veri)" count={report.warned} total={report.totalTests} icon={AlertTriangle} color="amber" tests={report.tests.filter(t => t.status === 'WARN')} />
          </div>
        </>
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
