import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GstService } from './gst.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('GST')
@Controller('gst')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GstController {
  constructor(private gstService: GstService) {}

  @Get('register')
  @ApiOperation({ summary: 'GST Purchase Register' })
  async purchaseRegister(@Req() req: any, @Query() query: { startDate?: string; endDate?: string }) {
    return this.gstService.getPurchaseRegister(req.user.orgId, query);
  }

  @Get('hsn')
  @ApiOperation({ summary: 'HSN/SAC Summary' })
  async hsnSummary(@Req() req: any) {
    return this.gstService.getHsnSummary(req.user.orgId);
  }

  @Get('gstr1')
  @ApiOperation({ summary: 'GSTR-1 Data' })
  async gstr1(@Req() req: any) {
    return this.gstService.getGstr1Data(req.user.orgId);
  }

  @Get('gstr3b')
  @ApiOperation({ summary: 'GSTR-3B Data' })
  async gstr3b(@Req() req: any) {
    return this.gstService.getGstr3bData(req.user.orgId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'GST Statistics' })
  async stats(@Req() req: any) {
    return this.gstService.getStats(req.user.orgId);
  }
}