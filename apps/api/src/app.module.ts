import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AssetModule } from './assets/assets.module';
import { GstModule } from './gst/gst.module';
import { TdsModule } from './tds/tds.module';
import { AuditModule } from './audit/audit.module';
import { ExportModule } from './export/export.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VendorsModule,
    InvoicesModule,
    AssetModule,
    GstModule,
    TdsModule,
    AuditModule,
    ExportModule,
  ],
})
export class AppModule {}