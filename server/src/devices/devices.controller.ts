import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { QueryDevicesDto } from './dto/query-devices.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';
import { multerConfig } from '../common/config/multer.config';
import type { Express } from 'express';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @Public()
  findAll(@Query() query: QueryDevicesDto) {
    return this.devicesService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }

  // ✅ Обновление основного изображения (загрузка файла)
  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Roles(Role.ADMIN)
  async uploadMainImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.devicesService.updateMainImage(+id, file);
  }

  // ✅ Добавление доп. изображения (загрузка файла)
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Roles(Role.ADMIN)
  async uploadDeviceImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.devicesService.addDeviceImage(+id, file);
  }

  // ✅ Удаление доп. изображения (с очисткой файла)
  @Delete(':id/images/:imageId')
  @Roles(Role.ADMIN)
  async deleteDeviceImage(@Param('id') deviceId: string, @Param('imageId') imageId: string) {
    return this.devicesService.removeDeviceImage(+deviceId, +imageId);
  }
}
