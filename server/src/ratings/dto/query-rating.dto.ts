import { IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryRatingDto {
  @IsOptional()
  @Type(() => Number) // Преобразует строку "1" → число 1
  @IsInt()
  @Min(1)
  deviceId?: number; // Фильтр по товару

  @IsOptional()
  @Transform(({ value }) => {
    // Преобразует строку "true"/"false" → булево значение
    if (value === 'true') return true;
    if ( value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hidden?: boolean; // Только для админа: показать скрытые
}