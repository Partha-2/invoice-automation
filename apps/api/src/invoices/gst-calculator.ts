// Supply type enum - using string to avoid Prisma dependency issues
export type SupplyType = 'INTRA' | 'INTER' | 'EXEMPT';

export const SupplyType = {
  INTRA: 'INTRA',
  INTER: 'INTER',
  EXEMPT: 'EXEMPT',
} as const;

export class GstCalculator {
  static calculate(
    amount: number,
    gstRate: number = 18,
    supplyType: string = 'INTRA',
  ) {
    const taxableAmount = amount;
    const isExempt = supplyType === 'EXEMPT' || gstRate === 0;

    if (isExempt) {
      return {
        amount: taxableAmount,
        gstAmount: 0,
        grossAmount: taxableAmount,
        supplyType: 'INTRA' as SupplyType,
        cgst: 0,
        sgst: 0,
        igst: 0,
      };
    }

    const gstAmount = taxableAmount * (gstRate / 100);
    const grossAmount = taxableAmount + gstAmount;

    const cgst = supplyType === 'INTRA' ? gstAmount / 2 : 0;
    const sgst = supplyType === 'INTRA' ? gstAmount / 2 : 0;
    const igst = supplyType === 'INTER' ? gstAmount : 0;

    return {
      amount: taxableAmount,
      gstAmount,
      grossAmount,
      supplyType: supplyType as SupplyType,
      cgst,
      sgst,
      igst,
    };
  }

  static calculateFromGross(grossAmount: number, gstRate: number = 18, supplyType: string = 'INTRA') {
    const taxableAmount = grossAmount / (1 + gstRate / 100);
    const gstAmount = grossAmount - taxableAmount;

    const cgst = supplyType === 'INTRA' ? gstAmount / 2 : 0;
    const sgst = supplyType === 'INTRA' ? gstAmount / 2 : 0;
    const igst = supplyType === 'INTER' ? gstAmount : 0;

    return {
      amount: taxableAmount,
      gstAmount,
      grossAmount,
      supplyType: supplyType as SupplyType,
      cgst,
      sgst,
      igst,
    };
  }

  static suggestHSN(description: string): string | null {
    const keywords: Record<string, string> = {
      'software': '998314',
      'development': '998314',
      'consulting': '998311',
      'professional': '998311',
      'legal': '998411',
      'accounting': '998332',
      'audit': '998331',
      'hosting': '998315',
      'cloud': '998315',
      'aws': '998315',
      'azure': '998315',
      'server': '998315',
      'IT': '998314',
      'computer': '8471',
      'laptop': '8471',
      'hardware': '8473',
      'furniture': '9403',
      'office': '9403',
      'vehicle': '8703',
      'car': '8703',
      'phone': '8517',
      'mobile': '8517',
      'print': '4901',
      'book': '4901',
    };

    const desc = description.toLowerCase();
    for (const [keyword, hsn] of Object.entries(keywords)) {
      if (desc.includes(keyword)) {
        return hsn;
      }
    }

    return null;
  }

  static getGstRateForHSN(hsnCode: string): number {
    const hsnRates: Record<string, number> = {
      '998314': 18,
      '998315': 18,
      '998311': 18,
      '998312': 18,
      '998331': 18,
      '998332': 18,
      '998411': 18,
      '998421': 18,
      '998431': 18,
      '8471': 18,
      '8473': 18,
      '9403': 18,
      '8517': 12,
      '8703': 28,
      '4901': 0,
      '995411': 12,
      '995412': 12,
      '996511': 5,
      '996512': 18,
    };

    return hsnRates[hsnCode] || 18;
  }
}