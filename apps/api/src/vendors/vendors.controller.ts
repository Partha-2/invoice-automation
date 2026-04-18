import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto } from './vendors.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  @ApiResponse({ status: 200 })
  async findAll(@Req() req: any, @Query() query: VendorQueryDto) {
    return this.vendorsService.findAll(req.user.orgId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get vendor statistics' })
  @ApiResponse({ status: 200 })
  async stats(@Req() req: any) {
    return this.vendorsService.getStats(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.vendorsService.findOne(req.user.orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created' })
  async create(@Req() req: any, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(req.user.orgId, req.user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.update(req.user.orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vendor' })
  @ApiResponse({ status: 200, description: 'Vendor deleted' })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.vendorsService.delete(req.user.orgId, id);
  }
}