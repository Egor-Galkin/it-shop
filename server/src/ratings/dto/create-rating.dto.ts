import { IsInt, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rate!: number;

  @IsInt()
  deviceId!: number;

  @IsString()
  @IsOptional()
  description?: string;

}
