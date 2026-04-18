import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportZoho(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, status: { in: ['PENDING', 'APPROVED'] } },
      include: { vendor: true },
    });

    return invoices.map(inv => ({
      VendorName: inv.vendor.name,
      BillDate: inv.invoiceDate,
      Description: inv.description,
      TaxAmount: inv.gstAmount,
      TDSAmount: inv.tdsAmount,
      Total: inv.grossAmount,
      Status: inv.status,
    }));
  }

  async exportQuickBooks(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, status: { in: ['PENDING', 'APPROVED'] } },
      include: { vendor: true },
    });

    return invoices.map(inv => ({
      Vendor: inv.vendor.name,
      TxnDate: inv.invoiceDate,
      Amount: inv.grossAmount,
      TaxCode: inv.gstRate,
      Status: inv.status,
    }));
  }

  async exportTally(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId, status: { in: ['PENDING', 'APPROVED'] } },
      include: { vendor: true },
    });

    return invoices.map(inv => ({
      VoucherDate: inv.invoiceDate,
      PartyLedger: inv.vendor.name,
      TDSAmount: inv.tdsAmount,
      GSTAmt: inv.gstAmount,
      NetAmount: inv.grossAmount,
      Narration: inv.narration,
    }));
  }

  async exportAuditPackage(orgId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { orgId },
      include: { vendor: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(inv => ({
      InvoiceNumber: inv.invoiceNumber,
      Date: inv.invoiceDate,
      Vendor: inv.vendor.name,
      VendorPAN: inv.vendor.pan,
      Amount: inv.amount,
      GSTRate: inv.gstRate,
      GSTAmount: inv.gstAmount,
      TDSCode: inv.tdsCode,
      TDSAmount: inv.tdsAmount,
      NetAmount: inv.grossAmount,
      Status: inv.status,
      Narration: inv.narration,
      SourceURL: inv.sourceUrl,
      OverrideReason: inv.overrideReason,
      CreatedAt: inv.createdAt,
    }));
  }
}