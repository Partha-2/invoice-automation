import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto } from './vendors.dto';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: VendorQueryDto) {
    const { search, status, vendorType, gstStatus, page = 1, limit = 50 } = query;

    const where: any = { orgId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { pan: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && (status as any) !== 'ALL') {
      where.status = status;
    }

    if (vendorType) {
      where.vendorType = vendorType;
    }

    if (gstStatus) {
      where.gstStatus = gstStatus;
    }

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        select: {
          id: true,
          name: true,
          pan: true,
          gstin: true,
          stateCode: true,
          defaultTdsCode: true,
          accountNumber: true,
          ifscCode: true,
          bankName: true,
          email: true,
          contactName: true,
          phone: true,
          vendorType: true,
          gstStatus: true,
          panStatus: true,
          status: true,
          createdAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      data: vendors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(orgId: string, vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!vendor || vendor.orgId !== orgId) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async create(orgId: string, userId: string, dto: CreateVendorDto) {
    // Check for duplicate PAN
    const existingPan = await this.prisma.vendor.findUnique({
      where: { pan: dto.pan },
    });

    if (existingPan) {
      throw new ConflictException('Vendor with this PAN already exists');
    }

    // Check for duplicate GSTIN if provided
    if (dto.gstin) {
      const existingGstin = await this.prisma.vendor.findUnique({
        where: { gstin: dto.gstin },
      });

      if (existingGstin) {
        throw new ConflictException('Vendor with this GSTIN already exists');
      }
    }

    return this.prisma.vendor.create({
      data: {
        name: dto.name,
        pan: dto.pan || '',
        orgId,
        gstin: dto.gstin,
        stateCode: dto.stateCode,
        defaultTdsCode: dto.defaultTdsCode,
        accountNumber: dto.accountNumber,
        ifscCode: dto.ifscCode,
        bankName: dto.bankName,
        email: dto.email,
        contactName: dto.contactName,
        phone: dto.phone,
        vendorType: dto.vendorType,
        gstStatus: dto.gstStatus,
        panStatus: dto.panStatus,
      },
    });
  }

  async update(orgId: string, vendorId: string, dto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || vendor.orgId !== orgId) {
      throw new NotFoundException('Vendor not found');
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: dto,
    });
  }

  async delete(orgId: string, vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || vendor.orgId !== orgId) {
      throw new NotFoundException('Vendor not found');
    }

    // Check for linked invoices
    const invoiceCount = await this.prisma.invoice.count({
      where: { vendorId },
    });

    if (invoiceCount > 0) {
      // Soft delete - just mark as inactive
      return this.prisma.vendor.update({
        where: { id: vendorId },
        data: { status: 'INACTIVE' },
      });
    }

    // Hard delete if no invoices
    return this.prisma.vendor.delete({
      where: { id: vendorId },
    });
  }

  async getStats(orgId: string) {
    const [total, active, inactive, msme, individual] = await Promise.all([
      this.prisma.vendor.count({ where: { orgId } }),
      this.prisma.vendor.count({ where: { orgId, status: 'ACTIVE' } }),
      this.prisma.vendor.count({ where: { orgId, status: 'INACTIVE' } }),
      this.prisma.vendor.count({ where: { orgId, vendorType: 'MSME' } }),
      this.prisma.vendor.count({ where: { orgId, vendorType: 'INDIVIDUAL' } }),
    ]);

    return { total, active, inactive, msme, individual };
  }
}