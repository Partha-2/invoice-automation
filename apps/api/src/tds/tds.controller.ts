import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TdsService } from './tds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('TDS')
@Controller('tds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TdsController {
  constructor(private tdsService: TdsService) {}

  @Get('register')
  @ApiOperation({ summary: 'TDS Register' })
  async register(@Req() req: any) {
    return this.tdsService.getRegister(req.user.orgId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'TDS Summary' })
  async summary(@Req() req: any) {
    return this.tdsService.getSummary(req.user.orgId);
  }

  @Get('challan')
  @ApiOperation({ summary: 'Challan Data' })
  async challan(@Req() req: any) {
    return this.tdsService.getChallanData(req.user.orgId);
  }

  @Get('codes')
  @ApiOperation({ summary: 'Payment Codes Reference' })
  async codes() {
    return this.tdsService.getPaymentCodes();
  }

  @Get('stats')
  @ApiOperation({ summary: 'TDS Statistics' })
  async stats(@Req() req: any) {
    return this.tdsService.getStats(req.user.orgId);
  }
}