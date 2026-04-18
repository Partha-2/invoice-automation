import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GstService {
  constructor(private prisma: PrismaService) {}

  async getPurchaseRegister(orgId: string, query: { startDate?: string; endDate?: string }) {
    const where: any = { orgId, gstAmount: { gt: 0 } };

    if (query.startDate || query.endDate) {
      where.invoiceDate = {};
      if (query.startDate) where.invoiceDate.gte = new Date(query.startDate);
      if (query.endDate) where.invoiceDate.lte = new Date(query.endDate);
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        vendor: { select: { name: true, gstin: true } },
      },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async getHsnSummary(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, hsnCode: { not: null } },
      select: { hsnCode: true, amount: true, cgst: true, sgst: true, igst: true, gstAmount: true },
    });

    const hsnMap = new Map();
    for (const inv of invoices) {
      const code = inv.hsnCode || 'Other';
      if (!hsnMap.has(code)) {
        hsnMap.set(code, { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
      }
      const entry = hsnMap.get(code);
      entry.taxable += Number(inv.amount || 0);
      entry.cgst += Number(inv.cgst || 0);
      entry.sgst += Number(inv.sgst || 0);
      entry.igst += Number(inv.igst || 0);
      entry.total += Number(inv.gstAmount || 0);
    }

    return Object.fromEntries(hsnMap);
  }

  async getGstr1Data(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, gstAmount: { gt: 0 } },
      include: { vendor: { select: { name: true, gstin: true } } },
    });

    return invoices.map(inv => ({
      gstin: inv.vendor.gstin,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      taxableValue: inv.amount,
      hsn: inv.hsnCode,
      rate: inv.gstRate,
      supplyType: inv.supplyType,
      cgst: inv.cgst,
      sgst: inv.sgst,
      igst: inv.igst,
    }));
  }

  async getGstr3bData(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, vendor: { gstStatus: 'ACTIVE' }, gstAmount: { gt: 0 } },
    });

    let totalCgst = 0, totalSgst = 0, totalIgst = 0;
    for (const inv of invoices) {
      totalCgst += Number(inv.cgst || 0);
      totalSgst += Number(inv.sgst || 0);
      totalIgst += Number(inv.igst || 0);
    }

    return {
      itcClaim: {
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        total: totalCgst + totalSgst + totalIgst,
      },
    };
  }

  async getStats(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, gstAmount: { gt: 0 } },
    });

    let totalGst = 0, cgst = 0, sgst = 0, igst = 0;
    for (const inv of invoices) {
      totalGst += Number(inv.gstAmount || 0);
      cgst += Number(inv.cgst || 0);
      sgst += Number(inv.sgst || 0);
      igst += Number(inv.igst || 0);
    }

    const creditEligible = await this.prisma.invoice.aggregate({
      where: { orgId, vendor: { gstStatus: 'ACTIVE' }, gstAmount: { gt: 0 } },
      _sum: { gstAmount: true },
    });

    return { totalGst, cgst, sgst, igst, creditEligible: creditEligible._sum.gstAmount || 0 };
  }
}