import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateRatingDto extends PartialType(
  OmitType(CreateRatingDto, ['deviceId']),
) {}

export class AdminUpdateRatingDto extends PartialType(CreateRatingDto) {
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
