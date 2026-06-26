import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}