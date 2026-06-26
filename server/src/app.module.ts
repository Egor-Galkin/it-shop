import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypesModule } from './types/types.module';
import { BrandsModule } from './brands/brands.module';
import { DevicesModule } from './devices/devices.module';
import { DeviceInfoModule } from './device-info/device-info.module';
import { DeviceImagesModule } from './device-images/device-images.module';
import { DiscountsModule } from './discounts/discounts.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RatingsModule } from './ratings/ratings.module';
import { BasketModule } from './basket/basket.module';
import { DeliveryOptionsModule } from './delivery-options/delivery-options.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypesModule,
    BrandsModule,
    DevicesModule,
    DeviceInfoModule,
    DeviceImagesModule,
    DiscountsModule,
    UsersModule,
    AuthModule,
    RatingsModule,
    BasketModule,
    DeliveryOptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
