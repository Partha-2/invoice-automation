import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto, ApproveInvoiceDto } from './invoices.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  async findAll(@Req() req: any, @Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAll(req.user.orgId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get invoice statistics' })
  async stats(@Req() req: any) {
    return this.invoicesService.getStats(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.findOne(req.user.orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new invoice' })
  async create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.orgId, req.user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(req.user.orgId, id, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve invoice' })
  async approve(@Req() req: any, @Param('id') id: string, @Body() dto: ApproveInvoiceDto) {
    return this.invoicesService.approve(req.user.orgId, req.user.sub, id, dto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject invoice' })
  async reject(@Req() req: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.invoicesService.reject(req.user.orgId, req.user.sub, id, body.reason);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  async markPaid(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.markPaid(req.user.orgId, req.user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.delete(req.user.orgId, req.user.sub, id);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload invoice PDF' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    return this.invoicesService.uploadFile(req.user.orgId, id, file);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download invoice PDF' })
  async downloadFile(@Req() req: any, @Param('id') id: string, @Res() res: any) {
    return this.invoicesService.downloadFile(req.user.orgId, id, res);
  }
}