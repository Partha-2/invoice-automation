import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_CODES } from '../invoices/tds-calculator';

@Injectable()
export class TdsService {
  constructor(private prisma: PrismaService) {}

  async getRegister(orgId: string) {
    return this.prisma.invoice.findMany({
      where: { orgId, tdsAmount: { gt: 0 } },
      include: {
        vendor: { select: { name: true, pan: true } },
      },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async getSummary(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, tdsAmount: { gt: 0 } },
    });

    const codeMap = new Map();
    let total = 0, s393 = 0, s394 = 0, overrides = 0;

    for (const inv of invoices) {
      const amount = Number(inv.tdsAmount || 0);
      total += amount;
      if (inv.tdsSection === '393') s393 += amount;
      if (inv.tdsSection === '394') s394 += amount;
      if (inv.isOverride) overrides += 1;

      const code = inv.tdsCode || 'unknown';
      codeMap.set(code, (codeMap.get(code) || 0) + amount);
    }

    const byCode = Array.from(codeMap.entries()).map(([code, amount]) => {
      const pc = PAYMENT_CODES.find(p => p.code === code);
      return { code, nature: pc?.nature || code, rate: pc?.rate || 0, section: pc?.section, amount };
    });

    return { total, s393, s394, overrides, byCode };
  }

  async getChallanData(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, tdsAmount: { gt: 0 }, status: { in: ['APPROVED', 'PAID'] } },
      include: { vendor: { select: { name: true, pan: true } } },
    });

    return invoices.map(inv => ({
      vendorName: inv.vendor.name,
      pan: inv.vendor.pan,
      grossAmount: inv.amount,
      tdsCode: inv.tdsCode,
      tdsRate: inv.tdsRate,
      tdsAmount: inv.tdsAmount,
      section: inv.tdsSection,
      invoiceNumber: inv.invoiceNumber,
    }));
  }

  async getPaymentCodes() {
    return PAYMENT_CODES;
  }

  async getStats(orgId: string) {
    const [total, s393, s394, overrides] = await Promise.all([
      this.prisma.invoice.aggregate({ where: { orgId, tdsAmount: { gt: 0 } }, _sum: { tdsAmount: true } }),
      this.prisma.invoice.aggregate({ where: { orgId, tdsAmount: { gt: 0 }, tdsSection: '393' }, _sum: { tdsAmount: true } }),
      this.prisma.invoice.aggregate({ where: { orgId, tdsAmount: { gt: 0 }, tdsSection: '394' }, _sum: { tdsAmount: true } }),
      this.prisma.invoice.count({ where: { orgId, isOverride: true } }),
    ]);

    return {
      total: total._sum.tdsAmount || 0,
      s393: s393._sum.tdsAmount || 0,
      s394: s394._sum.tdsAmount || 0,
      overrides,
    };
  }
}