import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateDeviceInfoDto } from './create-device-info.dto';

export class UpdateDeviceInfoDto extends PartialType(
    OmitType(CreateDeviceInfoDto, ['deviceId']),
) {}
