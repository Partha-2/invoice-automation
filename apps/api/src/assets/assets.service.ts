import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Define enums locally
export enum AssetCategory {
  IT_EQUIPMENT = 'IT_EQUIPMENT',
  FURNITURE = 'FURNITURE',
  PLANT_MACHINERY = 'PLANT_MACHINERY',
  VEHICLE = 'VEHICLE',
  BUILDING = 'BUILDING',
  OTHER = 'OTHER',
}

export enum DeprMethod {
  SLM = 'SLM',
  WDV = 'WDV',
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  DISPOSED = 'DISPOSED',
  UNDER_REPAIR = 'UNDER_REPAIR',
}

export interface DepreciationRow {
  year: number;
  openingNbv: number;
  depreciation: number;
  accumulated: number;
  closingNbv: number;
  yearEnd: string;
}

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.asset.findMany({
      where: { orgId },
      include: { invoice: { select: { invoiceNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { invoice: { select: { invoiceNumber: true } } },
    });

    if (!asset || asset.orgId !== orgId) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async create(orgId: string, data: any) {
    return this.prisma.asset.create({
      data: { orgId, ...data },
    });
  }

  async update(orgId: string, assetId: string, data: any) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.orgId !== orgId) {
      throw new NotFoundException('Asset not found');
    }

    if (data.status === 'DISPOSED') {
      data.currentNbv = 0;
    }

    return this.prisma.asset.update({ where: { id: assetId }, data });
  }

  async delete(orgId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.orgId !== orgId) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.asset.delete({ where: { id: assetId } });
  }

  async getSchedule(orgId: string, assetId: string) {
    const asset = await this.findOne(orgId, assetId);
    const schedule = this.calculateSchedule(asset);
    return { asset, schedule };
  }

  private calculateSchedule(asset: any): DepreciationRow[] {
    const rows: DepreciationRow[] = [];
    const purchaseValue = Number(asset.purchaseValue);
    const residualValue = Number(asset.residualValue || 0);
    const usefulLife = asset.usefulLife;
    const method = asset.deprMethod;

    let bookValue = purchaseValue;
    let totalDepr = 0;

    for (let year = 1; year <= usefulLife; year++) {
      let depr = 0;
      if (method === 'SLM') {
        depr = (purchaseValue - residualValue) / usefulLife;
      } else {
        const rate = 0.15;
        depr = bookValue * rate;
        if (depr > bookValue - residualValue) depr = bookValue - residualValue;
      }

      totalDepr += depr;
      bookValue = purchaseValue - totalDepr;

      if (bookValue < residualValue) {
        bookValue = residualValue;
        depr = purchaseValue - totalDepr - residualValue;
      }

      const yearEnd = new Date(asset.purchaseDate);
      yearEnd.setFullYear(yearEnd.getFullYear() + year);

      rows.push({
        year,
        openingNbv: year === 1 ? purchaseValue : rows[year - 2].closingNbv,
        depreciation: Math.round(depr),
        accumulated: Math.round(totalDepr),
        closingNbv: Math.round(bookValue),
        yearEnd: yearEnd.toISOString().split('T')[0],
      });
    }

    return rows;
  }

  async getStats(orgId: string) {
    const [total, active, idle, disposed] = await Promise.all([
      this.prisma.asset.count({ where: { orgId } }),
      this.prisma.asset.count({ where: { orgId, status: 'ACTIVE' } }),
      this.prisma.asset.count({ where: { orgId, status: 'IDLE' } }),
      this.prisma.asset.count({ where: { orgId, status: 'DISPOSED' } }),
    ]);

    const amounts = await this.prisma.asset.aggregate({
      where: { orgId },
      _sum: { purchaseValue: true, currentNbv: true, deprYtd: true },
    });

    return {
      total,
      active,
      idle,
      disposed,
      purchaseValue: amounts._sum.purchaseValue || 0,
      nbv: amounts._sum.currentNbv || 0,
      deprYtd: amounts._sum.deprYtd || 0,
    };
  }
}