import { IsEmail, IsString, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsUUID()
  orgId!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsUUID()
  orgId!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user!: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    orgId: string;
    organization?: any;
  };

  @ApiProperty()
  token!: {
    accessToken: string;
    tokenType: string;
  };
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  accessToken!: string;
}