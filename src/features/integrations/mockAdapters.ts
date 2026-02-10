/**
 * Mock Integration Adapters
 *
 * Realistic fake data sources for AI agents to simulate
 * integration with external systems.
 *
 * CRITICAL: These are MOCK adapters for demo purposes.
 * In production, replace with real API clients.
 */

export interface Invoice {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  anomalyFlag?: string;
}

export interface LinkedInProfile {
  name: string;
  currentCompany: string;
  currentRole: string;
  education: Array<{
    institution: string;
    degree: string;
    year: number;
  }>;
  pastExperience: Array<{
    company: string;
    role: string;
    years: string;
  }>;
  connections: number;
  conflictFlags?: string[];
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit';
  description: string;
  leadingDigit: number;
}

export interface SlackMessage {
  id: string;
  channel: string;
  user: string;
  text: string;
  timestamp: string;
  threadId?: string;
}

class MockSAPAdapter {
  private invoiceDatabase: Map<string, Invoice[]> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    const vendors = [
      { id: 'V001', name: 'Fraud_Corp Ltd.' },
      { id: 'V002', name: 'Acme Consulting' },
      { id: 'V003', name: 'TechVendor Inc.' },
      { id: 'V999', name: 'Supheli Vendor XYZ' },
    ];

    vendors.forEach((vendor) => {
      const invoices: Invoice[] = [];
      const invoiceCount = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < invoiceCount; i++) {
        const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + 30);

        const invoice: Invoice = {
          id: `INV-${vendor.id}-${String(i + 1).padStart(4, '0')}`,
          vendorId: vendor.id,
          vendorName: vendor.name,
          invoiceNumber: `${vendor.id}/2024/${String(i + 1).padStart(5, '0')}`,
          amount: Math.floor(Math.random() * 50000) + 1000,
          currency: 'TRY',
          date: date.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          status: ['pending', 'approved', 'paid'][Math.floor(Math.random() * 3)] as Invoice['status'],
        };

        if (vendor.id === 'V001' && i === 3) {
          invoice.amount = 9999;
          invoice.anomalyFlag = 'ROUNDED_AMOUNT';
        }

        if (vendor.id === 'V999' && i % 2 === 0) {
          invoice.amount = 9999.99;
          invoice.anomalyFlag = 'SUSPICIOUS_PATTERN';
        }

        invoices.push(invoice);
      }

      this.invoiceDatabase.set(vendor.id, invoices);
    });
  }

  async getInvoices(vendorId: string): Promise<Invoice[]> {
    await this.simulateDelay(800, 1500);

    const invoices = this.invoiceDatabase.get(vendorId);
    if (!invoices) {
      throw new Error(`Vendor ${vendorId} not found in SAP system`);
    }

    return invoices;
  }

  async searchInvoicesByAmount(minAmount: number, maxAmount: number): Promise<Invoice[]> {
    await this.simulateDelay(1000, 2000);

    const allInvoices: Invoice[] = [];
    this.invoiceDatabase.forEach((invoices) => {
      allInvoices.push(...invoices.filter((inv) => inv.amount >= minAmount && inv.amount <= maxAmount));
    });

    return allInvoices;
  }

  async getVendorRiskScore(vendorId: string): Promise<{
    vendorId: string;
    riskScore: number;
    flags: string[];
  }> {
    await this.simulateDelay(500, 1000);

    const invoices = await this.getInvoices(vendorId);
    const anomalyCount = invoices.filter((inv) => inv.anomalyFlag).length;
    const totalInvoices = invoices.length;
    const anomalyRate = anomalyCount / totalInvoices;

    const riskScore = Math.min(100, Math.floor(anomalyRate * 100) + Math.floor(Math.random() * 20));
    const flags: string[] = [];

    if (anomalyRate > 0.2) flags.push('HIGH_ANOMALY_RATE');
    if (invoices.some((inv) => inv.amount === 9999)) flags.push('ROUNDED_AMOUNT_PATTERN');
    if (vendorId === 'V999') flags.push('BLACKLIST_MATCH');

    return { vendorId, riskScore, flags };
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

class MockLinkedInAdapter {
  private profiles: Map<string, LinkedInProfile> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    this.profiles.set('Hayalet Calisan GHOST_001', {
      name: 'Hayalet Calisan GHOST_001',
      currentCompany: 'Phantom Industries',
      currentRole: 'Senior Procurement Officer',
      education: [
        {
          institution: 'Unknown University',
          degree: 'MBA',
          year: 2015,
        },
      ],
      pastExperience: [
        {
          company: 'Fraud_Corp Ltd.',
          role: 'Vendor Relations Manager',
          years: '2018-2020',
        },
        {
          company: 'Acme Bank',
          role: 'Procurement Specialist',
          years: '2020-Present',
        },
      ],
      connections: 47,
      conflictFlags: ['VENDOR_RELATIONSHIP', 'LOW_PROFILE_VISIBILITY'],
    });

    this.profiles.set('Ahmet Yilmaz', {
      name: 'Ahmet Yilmaz',
      currentCompany: 'Acme Bank',
      currentRole: 'Senior Auditor',
      education: [
        {
          institution: 'Bogazici University',
          degree: 'BS Finance',
          year: 2010,
        },
        {
          institution: 'Harvard Business School',
          degree: 'MBA',
          year: 2015,
        },
      ],
      pastExperience: [
        {
          company: 'KPMG',
          role: 'Audit Manager',
          years: '2015-2020',
        },
        {
          company: 'Acme Bank',
          role: 'Senior Auditor',
          years: '2020-Present',
        },
      ],
      connections: 1247,
    });

    this.profiles.set('Fatma Demir', {
      name: 'Fatma Demir',
      currentCompany: 'TechVendor Inc.',
      currentRole: 'CEO',
      education: [
        {
          institution: 'MIT',
          degree: 'BS Computer Science',
          year: 2005,
        },
      ],
      pastExperience: [
        {
          company: 'Google',
          role: 'Engineering Manager',
          years: '2005-2015',
        },
        {
          company: 'TechVendor Inc.',
          role: 'CEO',
          years: '2015-Present',
        },
      ],
      connections: 5432,
    });
  }

  async getProfile(name: string): Promise<LinkedInProfile | null> {
    await this.simulateDelay(1000, 2000);

    return this.profiles.get(name) || null;
  }

  async searchProfiles(company: string): Promise<LinkedInProfile[]> {
    await this.simulateDelay(1500, 2500);

    const results: LinkedInProfile[] = [];
    this.profiles.forEach((profile) => {
      if (
        profile.currentCompany.toLowerCase().includes(company.toLowerCase()) ||
        profile.pastExperience.some((exp) => exp.company.toLowerCase().includes(company.toLowerCase()))
      ) {
        results.push(profile);
      }
    });

    return results;
  }

  async detectConflictOfInterest(employeeName: string, vendorCompany: string): Promise<{
    hasConflict: boolean;
    evidence: string[];
  }> {
    await this.simulateDelay(1200, 1800);

    const profile = await this.getProfile(employeeName);
    if (!profile) {
      return { hasConflict: false, evidence: ['PROFILE_NOT_FOUND'] };
    }

    const evidence: string[] = [];
    const hasConflict = profile.pastExperience.some((exp) => {
      if (exp.company.toLowerCase().includes(vendorCompany.toLowerCase())) {
        evidence.push(`Past employment at ${exp.company} (${exp.years})`);
        return true;
      }
      return false;
    });

    if (profile.conflictFlags) {
      evidence.push(...profile.conflictFlags);
    }

    return { hasConflict, evidence };
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

class MockSlackAdapter {
  private messages: SlackMessage[] = [];
  private messageCounter = 1;

  async sendMessage(channel: string, user: string, text: string, threadId?: string): Promise<SlackMessage> {
    await this.simulateDelay(300, 800);

    const message: SlackMessage = {
      id: `msg_${String(this.messageCounter++).padStart(6, '0')}`,
      channel,
      user,
      text,
      timestamp: new Date().toISOString(),
      threadId,
    };

    this.messages.push(message);

    console.log(`[MockSlack] Message sent to ${channel}:`, text);

    return message;
  }

  async getChannelHistory(channel: string, limit: number = 50): Promise<SlackMessage[]> {
    await this.simulateDelay(500, 1000);

    return this.messages
      .filter((msg) => msg.channel === channel)
      .slice(-limit);
  }

  async createThread(channel: string, user: string, initialMessage: string): Promise<string> {
    await this.simulateDelay(400, 900);

    const threadId = `thread_${Date.now()}`;
    await this.sendMessage(channel, user, initialMessage, threadId);

    return threadId;
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

class MockCoreBankingAdapter {
  private transactionDatabase: Map<string, Transaction[]> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    const accounts = ['ACC001', 'ACC002', 'ACC003', 'ACC_FRAUD'];

    accounts.forEach((accountId) => {
      const transactions: Transaction[] = [];
      const txCount = Math.floor(Math.random() * 500) + 100;

      for (let i = 0; i < txCount; i++) {
        const amount = this.generateAmount(accountId);
        const leadingDigit = parseInt(String(amount)[0]);

        const transaction: Transaction = {
          id: `TX-${accountId}-${String(i + 1).padStart(6, '0')}`,
          accountId,
          date: this.randomDate(2024, 0, 11).toISOString().split('T')[0],
          amount,
          currency: 'TRY',
          type: Math.random() > 0.5 ? 'debit' : 'credit',
          description: this.randomDescription(),
          leadingDigit,
        };

        transactions.push(transaction);
      }

      this.transactionDatabase.set(accountId, transactions);
    });
  }

  private generateAmount(accountId: string): number {
    if (accountId === 'ACC_FRAUD') {
      const shouldAnomaly = Math.random() > 0.3;
      if (shouldAnomaly) {
        return Math.floor(Math.random() * 900) + 100;
      }
    }

    const benfordDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const benfordWeights = [0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

    const rand = Math.random();
    let cumulativeWeight = 0;
    let selectedDigit = 1;

    for (let i = 0; i < benfordDigits.length; i++) {
      cumulativeWeight += benfordWeights[i];
      if (rand <= cumulativeWeight) {
        selectedDigit = benfordDigits[i];
        break;
      }
    }

    const magnitude = Math.pow(10, Math.floor(Math.random() * 4) + 2);
    const randomFraction = Math.random();

    return Math.floor(selectedDigit * magnitude + randomFraction * magnitude);
  }

  private randomDate(year: number, startMonth: number, endMonth: number): Date {
    const month = Math.floor(Math.random() * (endMonth - startMonth + 1)) + startMonth;
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }

  private randomDescription(): string {
    const descriptions = [
      'ATM Withdrawal',
      'POS Purchase - Retail',
      'Wire Transfer',
      'Salary Deposit',
      'Utility Payment',
      'Loan Repayment',
      'Insurance Premium',
      'Investment Purchase',
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  async getTransactions(accountId: string, startDate?: string, endDate?: string): Promise<Transaction[]> {
    await this.simulateDelay(1000, 2000);

    let transactions = this.transactionDatabase.get(accountId);
    if (!transactions) {
      throw new Error(`Account ${accountId} not found in core banking system`);
    }

    if (startDate || endDate) {
      transactions = transactions.filter((tx) => {
        if (startDate && tx.date < startDate) return false;
        if (endDate && tx.date > endDate) return false;
        return true;
      });
    }

    return transactions;
  }

  async analyzeBenfordsLaw(accountId: string): Promise<{
    accountId: string;
    totalTransactions: number;
    digitDistribution: Record<number, number>;
    expectedDistribution: Record<number, number>;
    chiSquareScore: number;
    anomalyDetected: boolean;
  }> {
    await this.simulateDelay(2000, 3000);

    const transactions = await this.getTransactions(accountId);
    const digitDistribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
    };

    transactions.forEach((tx) => {
      digitDistribution[tx.leadingDigit]++;
    });

    const totalTransactions = transactions.length;
    Object.keys(digitDistribution).forEach((digit) => {
      digitDistribution[parseInt(digit)] = digitDistribution[parseInt(digit)] / totalTransactions;
    });

    const expectedDistribution: Record<number, number> = {
      1: 0.301, 2: 0.176, 3: 0.125, 4: 0.097, 5: 0.079,
      6: 0.067, 7: 0.058, 8: 0.051, 9: 0.046,
    };

    let chiSquare = 0;
    Object.keys(expectedDistribution).forEach((digit) => {
      const d = parseInt(digit);
      const observed = digitDistribution[d] * totalTransactions;
      const expected = expectedDistribution[d] * totalTransactions;
      chiSquare += Math.pow(observed - expected, 2) / expected;
    });

    const anomalyDetected = chiSquare > 15.51;

    return {
      accountId,
      totalTransactions,
      digitDistribution,
      expectedDistribution,
      chiSquareScore: chiSquare,
      anomalyDetected,
    };
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export const mockSAP = new MockSAPAdapter();
export const mockLinkedIn = new MockLinkedInAdapter();
export const mockSlack = new MockSlackAdapter();
export const mockCoreBanking = new MockCoreBankingAdapter();

export interface IntegrationToolkit {
  sap: MockSAPAdapter;
  linkedin: MockLinkedInAdapter;
  slack: MockSlackAdapter;
  coreBanking: MockCoreBankingAdapter;
}

export function createMockToolkit(): IntegrationToolkit {
  return {
    sap: mockSAP,
    linkedin: mockLinkedIn,
    slack: mockSlack,
    coreBanking: mockCoreBanking,
  };
}
