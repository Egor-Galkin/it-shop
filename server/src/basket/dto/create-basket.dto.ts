import { IsOptional, IsInt, Min } from 'class-validator';

export class CreateBasketDto {
  // userId НЕ передаётся — берётся из токена (безопасность!)
  
  // Опционально: сразу добавить товар при создании корзины
  @IsOptional()
  @IsInt()
  @Min(1)
  deviceId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number; // По умолчанию 1
}
