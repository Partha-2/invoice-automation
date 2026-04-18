import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto, ApproveInvoiceDto } from './invoices.dto';
import { AssetService } from '../assets/assets.service';
import { AuditService } from '../audit/audit.service';
import { GstCalculator } from './gst-calculator';
import { TdsCalculator } from './tds-calculator';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private assetService: AssetService,
    private auditService: AuditService,
  ) {}

  async findAll(orgId: string, query: InvoiceQueryDto) {
    const { status, vendorId, search, startDate, endDate, page = 1, limit = 50 } = query;

    const where: any = { orgId };

    if (status && (status as any) !== 'ALL') {
      where.status = status;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { narration: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          vendor: {
            select: { id: true, name: true, pan: true, gstin: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { invoiceDate: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: true,
      },
    });

    if (!invoice || invoice.orgId !== orgId) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async create(orgId: string, userId: string, dto: CreateInvoiceDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: dto.vendorId },
    });

    if (!vendor || vendor.orgId !== orgId) {
      throw new BadRequestException('Invalid vendor');
    }

    // Check for duplicate invoice number
    const existing = await this.prisma.invoice.findUnique({
      where: { orgId_invoiceNumber: { orgId, invoiceNumber: dto.invoiceNumber } },
    });

    if (existing) {
      throw new BadRequestException('Invoice number already exists');
    }

    // Calculate GST
    const gstCalc = GstCalculator.calculate(
      dto.amount,
      dto.gstRate || 18,
      dto.supplyType || 'INTRA',
    );

    // Calculate TDS
    const tdsCalc = TdsCalculator.calculate(
      dto.amount,
      dto.tdsCode || vendor.defaultTdsCode || '1002',
      vendor.panStatus === 'INVALID',
    );

    const invoice = await this.prisma.invoice.create({
      data: {
        orgId,
        vendorId: dto.vendorId,
        invoiceNumber: dto.invoiceNumber,
        invoiceDate: new Date(dto.invoiceDate),
        description: dto.description,
        narration: dto.narration,
        sourceUrl: dto.sourceUrl,

        // Amounts - use spread after amounts to allow override
        gstRate: dto.gstRate || 18,
        ...gstCalc,
        ...tdsCalc,

        // Supply & HSN
        supplyType: dto.supplyType || 'INTRA',
        hsnCode: dto.hsnCode,

        // Override
        isOverride: dto.isOverride || false,
        overrideReason: dto.overrideReason,

        // Asset
        isAsset: dto.isAsset || false,

        // Status
        status: 'PENDING',

        // Audit
        createdBy: userId,
      },
    });

    // Log audit
    await this.auditService.log(orgId, userId, 'INVOICE_CREATED', 'Invoice', invoice.id, {
      invoiceNumber: dto.invoiceNumber,
      vendor: vendor.name,
      amount: dto.amount,
    });

    return invoice;
  }

  async update(orgId: string, invoiceId: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.orgId !== orgId) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'PENDING' && invoice.status !== 'DRAFT') {
      throw new BadRequestException('Can only update pending or draft invoices');
    }

    // Recalculate if amounts changed
    let gstCalc = {};
    let tdsCalc = {};

    if (dto.amount || dto.gstRate || dto.supplyType) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: invoice.vendorId },
      });

      gstCalc = GstCalculator.calculate(
        Number(dto.amount || invoice.amount),
        Number(dto.gstRate || invoice.gstRate),
        dto.supplyType || invoice.supplyType,
      );

      tdsCalc = TdsCalculator.calculate(
        Number(dto.amount || invoice.amount),
        dto.tdsCode || invoice.tdsCode || '1002',
        vendor?.panStatus === 'INVALID',
      );
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...dto,
        ...gstCalc,
        ...tdsCalc,
      },
    });
  }

  async approve(orgId: string, userId: string, invoiceId: string, dto: ApproveInvoiceDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { vendor: true },
    });

    if (!invoice || invoice.orgId !== orgId) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'PENDING') {
      throw new BadRequestException('Can only approve pending invoices');
    }

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    await this.auditService.log(orgId, userId, 'INVOICE_APPROVED', 'Invoice', invoiceId, {
      invoiceNumber: invoice.invoiceNumber,
      vendor: invoice.vendor?.name,
      amount: invoice.grossAmount || invoice.amount,
    });

    return updated;
  }

  async reject(orgId: string, userId: string, invoiceId: string, reason?: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.orgId !== orgId) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'PENDING') {
      throw new BadRequestException('Can only reject pending invoices');
    }

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'REJECTED',
        rejectedBy: userId,
        rejectedAt: new Date(),
      },
    });

    await this.auditService.log(orgId, userId, 'INVOICE_REJECTED', 'Invoice', invoiceId, {
      invoiceNumber: invoice.invoiceNumber,
      reason,
    });

    return updated;
  }

  async markPaid(orgId: string, userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.orgId !== orgId) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'APPROVED') {
      throw new BadRequestException('Can only mark approved invoices as paid');
    }

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await this.auditService.log(orgId, userId, 'INVOICE_PAID', 'Invoice', invoiceId, {
      invoiceNumber: invoice.invoiceNumber,
    });

    return updated;
  }

  async delete(orgId: string, userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.orgId !== orgId) {
      throw new NotFoundException('Invoice not found');
    }

    await this.prisma.invoice.delete({
      where: { id: invoiceId },
    });

    await this.auditService.log(orgId, userId, 'INVOICE_DELETED', 'Invoice', invoiceId, {
      invoiceNumber: invoice.invoiceNumber,
    });
  }

  async getStats(orgId: string) {
    const [total, pending, approved, paid, rejected] = await Promise.all([
      this.prisma.invoice.count({ where: { orgId } }),
      this.prisma.invoice.count({ where: { orgId, status: 'PENDING' } }),
      this.prisma.invoice.count({ where: { orgId, status: 'APPROVED' } }),
      this.prisma.invoice.count({ where: { orgId, status: 'PAID' } }),
      this.prisma.invoice.count({ where: { orgId, status: 'REJECTED' } }),
    ]);

    const amounts = await this.prisma.invoice.aggregate({
      where: { orgId },
      _sum: {
        amount: true,
        gstAmount: true,
        tdsAmount: true,
      },
    });

    const approvedAmounts = await this.prisma.invoice.aggregate({
      where: { orgId, status: { in: ['APPROVED', 'PAID'] } },
      _sum: {
        grossAmount: true,
      },
    });

    return {
      total,
      pending,
      approved,
      paid,
      rejected,
      totalAmount: amounts._sum.amount || 0,
      totalGst: amounts._sum.gstAmount || 0,
      totalTds: amounts._sum.tdsAmount || 0,
      payableAmount: approvedAmounts._sum.grossAmount || 0,
    };
  }

  async uploadFile(orgId: string, id: string, file: any) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, orgId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const fileUrl = `/uploads/invoices/${file.filename}`;
    const fileName = file.originalname;

    await this.prisma.invoice.update({
      where: { id },
      data: { fileUrl, fileName },
    });

    await this.auditService.log(orgId, undefined, 'INVOICE_FILE_UPLOADED', 'Invoice', id, { fileName });

    return { fileUrl, fileName };
  }

  async downloadFile(orgId: string, id: string, res: any) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, orgId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (!invoice.fileUrl) {
      throw new NotFoundException('No file uploaded for this invoice');
    }

    const filePath = `.${invoice.fileUrl}`;
    res.download(filePath, invoice.fileName || 'invoice.pdf');
  }
}