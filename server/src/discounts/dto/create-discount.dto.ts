import { IsNumber, IsNotEmpty, IsISO8601, Min, Max } from 'class-validator';

export class CreateDiscountDto {
  @IsNumber()
  @IsNotEmpty()
  deviceId!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  value!: number;

  @IsISO8601()
  @IsNotEmpty()
  dateStart!: string;

  @IsISO8601()
  @IsNotEmpty()
  dateEnd!: string;
}