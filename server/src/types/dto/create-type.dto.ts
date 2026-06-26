import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
