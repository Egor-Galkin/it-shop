import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeviceImagesService } from './device-images.service';
import { CreateDeviceImageDto } from './dto/create-device-image.dto';
import { UpdateDeviceImageDto } from './dto/update-device-image.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';
import { multerConfig } from '../common/config/multer.config';
import type { Express } from 'express';

@Controller('device-images')
export class DeviceImagesController {
  constructor(private readonly deviceImagesService: DeviceImagesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDeviceImageDto: CreateDeviceImageDto) {
    return this.deviceImagesService.create(createDeviceImageDto);
  }

  @Get()
  @Public()
  findAll(@Query('deviceId') deviceId?: string) {
    return this.deviceImagesService.findAll(deviceId ? +deviceId : undefined);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.deviceImagesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDeviceImageDto: UpdateDeviceImageDto) {
    return this.deviceImagesService.update(+id, updateDeviceImageDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.deviceImagesService.remove(+id);
  }

  // ✅ Загрузка дополнительного изображения для устройства
  @Post('upload/:deviceId')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Roles(Role.ADMIN)
  async uploadImage(
    @Param('deviceId') deviceId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    const imageUrl = `/uploads/devices/${file.filename}`;
    
    return this.deviceImagesService.create({
      deviceId: +deviceId,
      img: imageUrl,
    });
  }

  // ✅ Удалить все изображения устройства
  @Delete('device/:deviceId')
  @Roles(Role.ADMIN)
  async deleteByDevice(@Param('deviceId') deviceId: string) {
    return this.deviceImagesService.deleteByDeviceId(+deviceId);
  }
}