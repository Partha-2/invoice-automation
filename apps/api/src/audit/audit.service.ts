import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(orgId: string, userId: string, action: string, entityType?: string, entityId?: string, details?: any) {
    return this.prisma.auditLog.create({
      data: { 
        orgId, 
        userId, 
        action, 
        entityType, 
        entityId, 
        details: details ? JSON.stringify(details) : null 
      },
    });
  }

  async findAll(orgId: string, options: { page?: number; limit?: number; entityType?: string; action?: string } = {}) {
    const { page = 1, limit = 50, entityType, action } = options;
    const where: any = { orgId };

    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    return this.prisma.auditLog.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}