import { IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryRatingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  deviceId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if ( value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hidden?: boolean;
}