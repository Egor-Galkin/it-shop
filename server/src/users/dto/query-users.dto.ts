import { IsOptional, IsString, IsNumber, IsEnum, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUsersDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string; // Поиск по email

  @IsOptional()
  @IsEnum(['CLIENT', 'ADMIN'])
  role?: string = 'CLIENT'; // Фильтр по роли

  @IsOptional()
  @IsString()
  @IsIn(['id', 'email', 'createdAt', 'ratings', 'orders'])
  orderBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDir?: 'asc' | 'desc' = 'desc';
}