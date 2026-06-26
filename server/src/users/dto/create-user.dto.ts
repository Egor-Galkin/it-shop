import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role; // По умолчанию будет 'CLIENT'
}
