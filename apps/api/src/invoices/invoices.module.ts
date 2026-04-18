import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { AssetModule } from '../assets/assets.module';
import { AuditModule } from '../audit/audit.module';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Module({
  imports: [
    AssetModule, 
    AuditModule,
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'invoices'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}