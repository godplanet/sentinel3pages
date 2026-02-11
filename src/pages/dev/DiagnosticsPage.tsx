import { useState } from 'react';
import { Activity, Play, CheckCircle2, XCircle, AlertTriangle, Database, Users, Building2, FileText, AlertCircle, Trash2, Wrench, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AutoTester, type DiagnosticReport } from '@/features/diagnostics/AutoTester';
import { forceReseed } from '@/shared/data/seed/turkey-bank-final';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function DiagnosticsPage() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoCleanup, setAutoCleanup] = useState(true);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    setReport(null);

    const tester = new AutoTester();

    const addLog = (message: string) => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    addLog('🤖 Initializing Sentinel Auto-Tester (SELF-HEALING)...');
    addLog('📋 Running full system diagnostics...');

    try {
      const result = await tester.runFullDiagnostics();

      if (result.selfHealed) {
        addLog('🧬 NOTE: Database was empty. Auto-seeded with Turkey Bank demo data.');
      }

      result.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        addLog(`${icon} ${test.test}: ${test.status} (${test.duration}ms)`);
        if (test.error) {
          addLog(`   └─ Error: ${test.error}`);
        }
      });

      setReport(result);
      addLog(`✅ Diagnostics complete: ${result.passed}/${result.totalTests} tests passed`);

      if (autoCleanup) {
        addLog('🧹 Cleaning up test data...');
        await tester.cleanupTestData();
        addLog('✅ Test data cleaned up');
      }
    } catch (error) {
      addLog(`❌ Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleForceReseed = async () => {
    if (!confirm('⚠️ UYARI: Bu işlem VERİTABANINI SİLER ve demo verileri yeniden yükler. Devam etmek istiyor musunuz?')) {
      return;
    }

    setIsReseeding(true);
    setLogs([]);
    setReport(null);

    const addLog = (message: string) => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    addLog('🚀 FORCE RESEED: Starting full database reset...');

    try {
      // Intercept console logs
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args: any[]) => {
        const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
        addLog(message);
        originalLog(...args);
      };

      console.error = (...args: any[]) => {
        const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
        addLog(`❌ ${message}`);
        originalError(...args);
      };

      console.warn = (...args: any[]) => {
        const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
        addLog(`⚠️ ${message}`);
        originalWarn(...args);
      };

      await forceReseed();

      // Restore console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

      addLog('✅ Force reseed complete!');
      addLog('🔄 Reloading page in 2 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      addLog(`❌ Force reseed failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Full error:', error);
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Diagnostics"
        description="Automated E2E testing and health monitoring for Sentinel GRC v3.0"
        icon={Activity}
      />

      {report && report.systemHealth.userCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-300 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                ⚠️ SİSTEMDE KULLANICI YOK - TEST YAPILAMAZ
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Veritabanı boş. Test simülasyonları çalışmayacak. Demo verileri yüklemek için aşağıdaki butona tıklayın.
              </p>
              <button
                onClick={handleForceReseed}
                disabled={isReseeding}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Wrench size={18} />
                {isReseeding ? 'Yükleniyor...' : 'ZORLA ONAR (Force Reseed)'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            label="Tenants"
            value={report.systemHealth.tenantCount}
            icon={Database}
            color="blue"
          />
          <StatCard
            label="Users"
            value={report.systemHealth.userCount}
            icon={Users}
            color={report.systemHealth.userCount === 0 ? 'red' : 'green'}
          />
          <StatCard
            label="Entities"
            value={report.systemHealth.entityCount}
            icon={Building2}
            color="purple"
          />
          <StatCard
            label="Engagements"
            value={report.systemHealth.engagementCount}
            icon={FileText}
            color="amber"
          />
          <StatCard
            label="Findings"
            value={report.systemHealth.findingCount}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            label="Workpapers"
            value={report.systemHealth.workpaperCount}
            icon={FileText}
            color="slate"
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Test Runner</h3>
            <p className="text-sm text-slate-600 mt-1">
              Simulates a full audit lifecycle: Planning → Library → Fieldwork → Findings → Reporting
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoCleanup}
                onChange={(e) => setAutoCleanup(e.target.checked)}
                className="rounded border-slate-300"
              />
              Auto-cleanup test data
            </label>
            <button
              onClick={forceReseed}
              disabled={isReseeding || isRunning}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all',
                isReseeding || isRunning
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md'
              )}
              title="Wipes database and reseeds with demo data"
            >
              {isReseeding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reseeding...
                </>
              ) : (
                <>
                  <Wrench size={18} />
                  Force Reseed
                </>
              )}
            </button>
            <button
              onClick={runDiagnostics}
              disabled={isRunning || isReseeding}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all',
                isRunning || isReseeding
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
              )}
            >
              {isRunning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Run Full System Simulation
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic">Console output will appear here...</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="text-green-400 py-0.5">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ResultCard
              title="Functional Modules"
              count={report.passed}
              total={report.totalTests}
              icon={CheckCircle2}
              color="green"
              tests={report.tests.filter(t => t.status === 'PASS')}
            />
            <ResultCard
              title="Broken Modules"
              count={report.failed}
              total={report.totalTests}
              icon={XCircle}
              color="red"
              tests={report.tests.filter(t => t.status === 'FAIL')}
            />
            <ResultCard
              title="Warnings"
              count={report.warned}
              total={report.totalTests}
              icon={AlertTriangle}
              color="amber"
              tests={report.tests.filter(t => t.status === 'WARN')}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Test Results</h3>
            <div className="space-y-3">
              {report.tests.map((test, idx) => (
                <TestResultRow key={idx} test={test} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-50 text-slate-600',
  }[color];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorClasses)}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}

interface ResultCardProps {
  title: string;
  count: number;
  total: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: 'green' | 'red' | 'amber';
  tests: any[];
}

function ResultCard({ title, count, total, icon: Icon, color, tests }: ResultCardProps) {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-900',
    },
  }[color];

  return (
    <div className={clsx('rounded-xl border p-6', colorClasses.bg, colorClasses.border)}>
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} className={colorClasses.icon} />
        <h3 className={clsx('text-lg font-bold', colorClasses.text)}>{title}</h3>
      </div>
      <div className={clsx('text-4xl font-bold mb-2', colorClasses.text)}>
        {count}
        <span className="text-2xl opacity-60">/{total}</span>
      </div>
      {tests.length > 0 && (
        <div className="mt-4 space-y-1">
          {tests.map((test, idx) => (
            <div key={idx} className="text-sm opacity-75">
              • {test.test}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TestResultRowProps {
  test: any;
}

function TestResultRow({ test }: TestResultRowProps) {
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = test.status === 'PASS' ? CheckCircle2 : test.status === 'FAIL' ? XCircle : AlertTriangle;
  const statusColor = test.status === 'PASS' ? 'text-green-600' : test.status === 'FAIL' ? 'text-red-600' : 'text-amber-600';
  const bgColor = test.status === 'PASS' ? 'bg-green-50' : test.status === 'FAIL' ? 'bg-red-50' : 'bg-amber-50';

  return (
    <div className={clsx('rounded-lg border p-4 transition-all', bgColor)}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <StatusIcon size={20} className={statusColor} />
          <div>
            <div className="font-semibold text-slate-900">{test.test}</div>
            {test.error && (
              <div className="text-sm text-red-600 mt-1">{test.error}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{test.duration}ms</span>
          <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', statusColor)}>
            {test.status}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && test.details && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-slate-300"
          >
            <pre className="text-xs text-slate-700 font-mono bg-white rounded p-3 overflow-x-auto">
              {JSON.stringify(test.details, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
