import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.assetService.findAll(req.user.orgId);
  }

  @Get('stats')
  async stats(@Req() req: any) {
    return this.assetService.getStats(req.user.orgId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.assetService.findOne(req.user.orgId, id);
  }

  @Get(':id/schedule')
  async schedule(@Req() req: any, @Param('id') id: string) {
    return this.assetService.getSchedule(req.user.orgId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    return this.assetService.create(req.user.orgId, data);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.assetService.update(req.user.orgId, id, data);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.assetService.delete(req.user.orgId, id);
  }
}