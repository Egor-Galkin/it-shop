import { IsInt, Min, IsOptional } from 'class-validator';

export class AddItemDto {
  @IsInt()
  @Min(1)
  deviceId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}