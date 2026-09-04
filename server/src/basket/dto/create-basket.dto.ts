import { IsOptional, IsInt, Min } from 'class-validator';

export class CreateBasketDto {

  @IsOptional()
  @IsInt()
  @Min(1)
  deviceId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
