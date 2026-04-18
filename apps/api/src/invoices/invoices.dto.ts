import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsDateString, IsBoolean, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// Invoice status enum
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

// Supply type enum
export enum SupplyType {
  INTRA = 'INTRA',
  INTER = 'INTER',
  EXEMPT = 'EXEMPT',
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsUUID()
  vendorId!: string;

  @ApiProperty({ example: 'INV-2026-001' })
  @IsString()
  invoiceNumber!: string;

  @ApiProperty()
  @IsDateString()
  invoiceDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  gstRate?: number;

  @ApiPropertyOptional({ enum: SupplyType })
  @IsOptional()
  @IsEnum(SupplyType)
  supplyType?: SupplyType;

  @ApiPropertyOptional({ example: '998314' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ example: '1002' })
  @IsOptional()
  @IsString()
  tdsCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOverride?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overrideReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAsset?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetUser?: string;
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}

export class ApproveInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class InvoiceQueryDto {
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class BulkImportInvoiceDto {
  @ApiProperty({ type: [CreateInvoiceDto] })
  @IsArray()
  vendors!: CreateInvoiceDto[];
}