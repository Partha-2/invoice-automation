import { Controller, Get, Put, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users in organization' })
  async findAll(@Req() req: any) {
    return this.usersService.findAll(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.usersService.findOne(req.user.orgId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: { firstName?: string; lastName?: string; role?: string },
  ) {
    return this.usersService.update(req.user.orgId, id, data);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deactivate(req.user.orgId, id);
  }
}