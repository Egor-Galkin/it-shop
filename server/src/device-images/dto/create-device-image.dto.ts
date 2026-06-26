import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDeviceImageDto {
  @IsNumber()
  @IsNotEmpty()
  deviceId!: number;

  @IsString()
  @IsNotEmpty()
  img!: string;
}