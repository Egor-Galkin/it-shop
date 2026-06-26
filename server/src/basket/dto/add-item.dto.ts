import { IsInt, Min, IsOptional } from 'class-validator';

export class AddItemDto {
  @IsInt()
  @Min(1)
  deviceId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number; // Если не передано — добавляем 1, если есть — увеличиваем
}