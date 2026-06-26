import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceImageDto } from './create-device-image.dto';

export class UpdateDeviceImageDto extends PartialType(CreateDeviceImageDto) {}