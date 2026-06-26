import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DeviceInfoService } from './device-info.service';
import { CreateDeviceInfoDto } from './dto/create-device-info.dto';
import { UpdateDeviceInfoDto } from './dto/update-device-info.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';

@Controller('device-info')
export class DeviceInfoController {
  constructor(private readonly deviceInfoService: DeviceInfoService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDeviceInfoDto: CreateDeviceInfoDto) {
    return this.deviceInfoService.create(createDeviceInfoDto);
  }

  @Get()
  @Public()
  findAll(@Query('deviceId') deviceId?: string) {
    const id = deviceId ? +deviceId : undefined;
    return this.deviceInfoService.findAll(id);
  }

  @Get('by-device/:deviceId')
  @Public()
  findByDevice(@Param('deviceId') deviceId: string) {
    return this.deviceInfoService.findByDevice(+deviceId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.deviceInfoService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDeviceInfoDto: UpdateDeviceInfoDto) {
    return this.deviceInfoService.update(+id, updateDeviceInfoDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.deviceInfoService.remove(+id);
  }
}
