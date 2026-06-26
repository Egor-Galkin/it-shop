import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

/*
export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['email', 'password'] as const),
) {}
*/

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}