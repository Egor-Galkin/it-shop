import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateDeviceInfoDto {
  @IsInt() @Min(1)
  deviceId!: number;

  @IsString() @IsNotEmpty()
  title!: string;

  @IsString() @IsNotEmpty()
  description!: string;
}
