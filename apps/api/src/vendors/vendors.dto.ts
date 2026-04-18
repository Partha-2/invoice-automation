import { IsString, IsOptional, IsEnum, IsEmail, MinLength, MaxLength, IsNumber, IsBoolean, IsUUID, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Define enums locally to avoid Prisma dependency issues
export enum VendorType {
  COMPANY = 'COMPANY',
  MSME = 'MSME',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum GstStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXEMPT = 'EXEMPT',
}

export enum PanStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateVendorDto {
  @ApiProperty({ example: 'TechServe India Pvt Ltd' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'AABCI1234D', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  pan?: string;

  @ApiPropertyOptional({ example: '29AABCI1234D1Z5', maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  gstin?: string;

  @ApiPropertyOptional({ example: '29' })
  @IsOptional()
  @IsString()
  stateCode?: string;

  @ApiPropertyOptional({ example: '1002' })
  @IsOptional()
  @IsString()
  defaultTdsCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ifscCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: VendorType })
  @IsOptional()
  @IsEnum(VendorType)
  vendorType?: VendorType;

  @ApiPropertyOptional({ enum: GstStatus })
  @IsOptional()
  @IsEnum(GstStatus)
  gstStatus?: GstStatus;

  @ApiPropertyOptional({ enum: PanStatus })
  @IsOptional()
  @IsEnum(PanStatus)
  panStatus?: PanStatus;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @ApiPropertyOptional({ enum: EntityStatus })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class VendorQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({ enum: VendorType })
  @IsOptional()
  @IsEnum(VendorType)
  vendorType?: VendorType;

  @ApiPropertyOptional({ enum: GstStatus })
  @IsOptional()
  @IsEnum(GstStatus)
  gstStatus?: GstStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class BulkImportVendorDto {
  @ApiProperty({ type: [CreateVendorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVendorDto)
  vendors!: CreateVendorDto[];
}