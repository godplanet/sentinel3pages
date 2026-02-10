import type { ControlRow, TestDesignResult, TestEffectivenessResult, ApprovalStatus } from './types';

const AUDITORS = [
  { id: 'a1', name: 'Hakan Yilmaz', initials: 'HY', color: 'bg-blue-600' },
  { id: 'a2', name: 'Ayse Demir', initials: 'AD', color: 'bg-emerald-600' },
  { id: 'a3', name: 'Mehmet Kaya', initials: 'MK', color: 'bg-amber-600' },
  { id: 'a4', name: 'Elif Celik', initials: 'EC', color: 'bg-rose-600' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CONTROLS_RAW: { id: string; title: string; desc: string; cat: string; risk: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [
  { id: 'IT-001', title: 'Password Complexity Policy', desc: 'Verify password complexity requirements meet policy standards (min 12 chars, uppercase, number, special)', cat: 'Access Control', risk: 'HIGH' },
  { id: 'IT-002', title: 'Multi-Factor Authentication', desc: 'Validate MFA is enforced for all privileged and remote access accounts', cat: 'Access Control', risk: 'HIGH' },
  { id: 'IT-003', title: 'User Access Review', desc: 'Quarterly review of user access rights and removal of terminated employees', cat: 'Access Control', risk: 'HIGH' },
  { id: 'IT-004', title: 'Privileged Account Management', desc: 'Review of privileged account inventory and monitoring controls', cat: 'Access Control', risk: 'HIGH' },
  { id: 'IT-005', title: 'Firewall Rule Review', desc: 'Annual review of firewall rules and removal of unnecessary open ports', cat: 'Network Security', risk: 'HIGH' },
  { id: 'IT-006', title: 'Intrusion Detection System', desc: 'IDS/IPS monitoring is active and alerts are reviewed within SLA', cat: 'Network Security', risk: 'MEDIUM' },
  { id: 'IT-007', title: 'Network Segmentation', desc: 'Critical systems are isolated in separate network segments with controlled access', cat: 'Network Security', risk: 'MEDIUM' },
  { id: 'IT-008', title: 'Backup & Recovery Procedures', desc: 'Daily incremental and weekly full backups are performed and tested quarterly', cat: 'Business Continuity', risk: 'HIGH' },
  { id: 'IT-009', title: 'Disaster Recovery Testing', desc: 'Annual DR test executed with documented results and remediation plans', cat: 'Business Continuity', risk: 'HIGH' },
  { id: 'IT-010', title: 'Physical Access to Data Center', desc: 'Biometric and badge access controls for server rooms with visitor logs', cat: 'Physical Security', risk: 'MEDIUM' },
  { id: 'IT-011', title: 'Change Management Process', desc: 'All production changes follow CAB approval and include rollback plans', cat: 'Change Management', risk: 'HIGH' },
  { id: 'IT-012', title: 'Patch Management', desc: 'Critical patches applied within 30 days, regular patches within 90 days', cat: 'Change Management', risk: 'HIGH' },
  { id: 'IT-013', title: 'Software Development Lifecycle', desc: 'Code review and security testing before production deployment', cat: 'Change Management', risk: 'MEDIUM' },
  { id: 'IT-014', title: 'Data Encryption at Rest', desc: 'AES-256 encryption for sensitive data stored in databases and file systems', cat: 'Data Protection', risk: 'HIGH' },
  { id: 'IT-015', title: 'Data Encryption in Transit', desc: 'TLS 1.2+ enforced for all internal and external data transmissions', cat: 'Data Protection', risk: 'MEDIUM' },
  { id: 'IT-016', title: 'Endpoint Protection', desc: 'Anti-malware and EDR agents deployed on all endpoints with central monitoring', cat: 'Endpoint Security', risk: 'MEDIUM' },
  { id: 'IT-017', title: 'Security Awareness Training', desc: 'Annual security awareness training completed by all employees with phishing simulations', cat: 'Governance', risk: 'LOW' },
  { id: 'IT-018', title: 'Incident Response Plan', desc: 'Documented IR plan with defined roles, tested via tabletop exercises annually', cat: 'Governance', risk: 'MEDIUM' },
  { id: 'IT-019', title: 'Vendor Risk Assessment', desc: 'Third-party vendors assessed for security posture before onboarding and annually', cat: 'Governance', risk: 'MEDIUM' },
  { id: 'IT-020', title: 'Logging & Monitoring', desc: 'Centralized SIEM with log retention of 12 months and real-time alerting', cat: 'Monitoring', risk: 'HIGH' },
];

export function generateMockControls(): ControlRow[] {
  const todValues: TestDesignResult[] = ['NOT_STARTED', 'EFFECTIVE', 'INEFFECTIVE', 'N/A'];
  const toeValues: TestEffectivenessResult[] = ['NOT_STARTED', 'EFFECTIVE', 'INEFFECTIVE'];
  const approvalStatuses: ApprovalStatus[] = ['in_progress', 'prepared', 'reviewed'];

  return CONTROLS_RAW.map((c, i) => {
    const isStarted = i < 8;
    const isFullyTested = i < 4;
    return {
      id: `ctrl-${i}`,
      control_id: c.id,
      title: c.title,
      description: c.desc,
      category: c.cat,
      tod: isStarted ? pick(todValues.filter(v => v !== 'NOT_STARTED')) : 'NOT_STARTED',
      toe: isStarted ? pick(toeValues.filter(v => v !== 'NOT_STARTED')) : 'NOT_STARTED',
      sample_size: isStarted ? [5, 10, 15, 20, 25, 30][Math.floor(Math.random() * 6)] : 0,
      auditor: pick(AUDITORS),
      risk_level: c.risk,
      approval_status: isFullyTested ? pick(approvalStatuses) : 'in_progress',
    };
  });
}
