import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';
import { IsOptional, IsBoolean } from 'class-validator';

// Клиент не может менять deviceId, userId, hidden
export class UpdateRatingDto extends PartialType(
  OmitType(CreateRatingDto, ['deviceId']),
) {}

// Отдельный DTO для админа (может менять hidden)
export class AdminUpdateRatingDto extends PartialType(CreateRatingDto) {
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
