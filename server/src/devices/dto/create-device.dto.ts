import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateDeviceInfoDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() description!: string;
}

export class CreateDeviceDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsNumber() @Min(0) price!: number;
  @IsInt() typeId!: number;
  @IsInt() brandId!: number;
  @IsString() @IsOptional() img?: string;
  @IsNumber() @IsOptional() rating?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeviceInfoDto)
  deviceInfos?: CreateDeviceInfoDto[];
}
