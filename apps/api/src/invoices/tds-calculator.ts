// ==========================================
// TDS CALCULATOR — ITA 2025 (TY 2026-27)
// Payment Codes 1001-1067 under Sections 392, 393, 394
// ==========================================

export interface PaymentCode {
  code: string;
  nature: string;
  old: string;
  rate: number;
  threshold: number;
  section: string;
}

// ITA 2025 Payment Codes
export const PAYMENT_CODES: PaymentCode[] = [
  { code: '1001', nature: 'Contract payments (Resident contractor)', old: '194C', rate: 2, threshold: 30000, section: '393' },
  { code: '1002', nature: 'Professional fees & technical services', old: '194J', rate: 10, threshold: 30000, section: '393' },
  { code: '1003', nature: 'Royalty — copyright, patent, brand', old: '194J', rate: 10, threshold: 30000, section: '393' },
  { code: '1004', nature: 'Rent of land, building, furniture', old: '194I(a)', rate: 10, threshold: 240000, section: '393' },
  { code: '1005', nature: 'Rent of plant, machinery, equipment', old: '194I(b)', rate: 2, threshold: 240000, section: '393' },
  { code: '1006', nature: 'Director fees (non-salary)', old: '194J', rate: 10, threshold: 0, section: '393' },
  { code: '1007', nature: 'Insurance commission', old: '194D', rate: 5, threshold: 15000, section: '393' },
  { code: '1008', nature: 'Commission / brokerage', old: '194H', rate: 5, threshold: 15000, section: '393' },
  { code: '1009', nature: 'Interest on securities', old: '193', rate: 10, threshold: 10000, section: '393' },
  { code: '1010', nature: 'Interest other than securities', old: '194A', rate: 10, threshold: 40000, section: '393' },
  { code: '1011', nature: 'Purchase of goods above threshold', old: '194Q', rate: 0.1, threshold: 5000000, section: '393' },
  { code: '1012', nature: 'Sale of lottery tickets', old: '194B', rate: 30, threshold: 10000, section: '393' },
  { code: '1013', nature: 'Winnings from horse race', old: '194BB', rate: 30, threshold: 10000, section: '393' },
  { code: '1014', nature: 'Payment to transport operators', old: '194C', rate: 1, threshold: 30000, section: '393' },
  { code: '1015', nature: 'Life insurance maturity proceeds', old: '194DA', rate: 5, threshold: 100000, section: '393' },
  { code: '1016', nature: 'MSME — contractor/professional', old: '194C/194J', rate: 2, threshold: 30000, section: '393' },
  { code: '1017', nature: 'Salary equivalent — specified payments', old: '192', rate: 0, threshold: 0, section: '392' },
  { code: '1018', nature: 'Non-resident technical services', old: '195', rate: 10, threshold: 0, section: '394' },
  { code: '1019', nature: 'Non-resident royalty', old: '195', rate: 10, threshold: 0, section: '394' },
  { code: '1020', nature: 'Non-resident business income', old: '195', rate: 40, threshold: 0, section: '394' },
  { code: '9999', nature: 'Nil — No TDS applicable', old: '—', rate: 0, threshold: 0, section: 'nil' },
  { code: '206AA', nature: 'PAN not furnished — Higher rate 206AA', old: '206AA', rate: 20, threshold: 0, section: '393' },
];

// Keyword to Payment Code mapping
const CODE_KEYWORDS: Record<string, string[]> = {
  '1001': ['contract', 'contractor', 'labour', 'manpower', 'fabrication', 'civil'],
  '1002': ['professional', 'consult', 'advisory', 'management', 'legal', 'audit', 'ca', 'chartered'],
  '1003': ['royalty', 'license', 'intellectual', 'copyright', 'patent', 'brand'],
  '1004': ['rent', 'lease', 'office space', 'building', 'property', 'furniture'],
  '1005': ['equipment rent', 'machine hire', 'machinery rent'],
  '1006': ['director', 'board', 'sitting fee'],
  '1007': ['insurance', 'premium', 'policy'],
  '1008': ['commission', 'brokerage', 'referral', 'agent', 'distribution'],
  '1009': ['interest', 'securities', 'debenture', 'bond'],
  '1010': ['interest', 'loan'],
  '1011': ['goods', 'purchase', 'supply', 'material', 'product', 'equipment'],
  '1014': ['transport', 'courier', 'freight', 'logistics', 'shipping'],
};

export class TdsCalculator {
  static calculate(amount: number, code: string, isPanInvalid: boolean = false) {
    // Use higher rate if PAN not furnished
    const effectiveCode = isPanInvalid ? '206AA' : code;
    const pc = this.getPaymentCode(effectiveCode);

    if (!pc || pc.rate === 0) {
      return {
        tdsCode: effectiveCode,
        tdsRate: 0,
        tdsAmount: 0,
        tdsSection: pc?.section || 'nil',
        isOverride: false,
      };
    }

    // Check threshold
    if (pc.threshold > 0 && amount < pc.threshold) {
      return {
        tdsCode: effectiveCode,
        tdsRate: 0,
        tdsAmount: 0,
        tdsSection: pc.section,
        isOverride: false,
      };
    }

    const tdsRate = pc.rate / 100;
    const tdsAmount = amount * tdsRate;

    return {
      tdsCode: effectiveCode,
      tdsRate: pc.rate,
      tdsAmount,
      tdsSection: pc.section,
      isOverride: isPanInvalid,
    };
  }

  static getPaymentCode(code: string): PaymentCode | undefined {
    return PAYMENT_CODES.find(p => p.code === code);
  }

  static suggestCode(description: string): string {
    const desc = description.toLowerCase();

    for (const [code, keywords] of Object.entries(CODE_KEYWORDS)) {
      if (keywords.some(k => desc.includes(k))) {
        return code;
      }
    }

    // Default to professional services
    return '1002';
  }

  static getAllCodes(): PaymentCode[] {
    return PAYMENT_CODES;
  }

  static getCodesBySection(section: string): PaymentCode[] {
    return PAYMENT_CODES.filter(p => p.section === section);
  }

  static calculateNet(amount: number, gstAmount: number, tdsAmount: number): number {
    return amount + gstAmount - tdsAmount;
  }

  static getSectionName(section: string): string {
    const names: Record<string, string> = {
      '392': 'Salary Payments',
      '393': 'Non-Salary Resident Payments',
      '394': 'Non-Resident Payments',
      'nil': 'No TDS',
    };
    return names[section] || section;
  }
}