import { IsInt, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rate!: number; // Оценка от 1 до 5

  @IsInt()
  deviceId!: number; // ID товара

  // userId НЕ передаётся клиентом — берётся из токена (безопасность!)

  @IsString()
  @IsOptional()
  description?: string; // Опциональный текст отзыва

  // hidden НЕ передаётся клиентом — только админ может менять
}
