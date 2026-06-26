import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min, ValidateIf } from 'class-validator';

export class CreateDeliveryOptionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['DELIVERY', 'PICKUP'])
  type!: 'DELIVERY' | 'PICKUP';

  @ValidateIf((o) => o.type === 'DELIVERY')
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  @IsOptional()
  price?: number;

  @ValidateIf((o) => o.type === 'PICKUP')
  @IsString({ message: 'Адрес должен быть строкой' })
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}