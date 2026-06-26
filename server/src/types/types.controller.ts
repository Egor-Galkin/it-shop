import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { TypesService } from './types.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  // Только ADMIN может создавать тип
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTypeDto: CreateTypeDto) {
    return this.typesService.create(createTypeDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.typesService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.typesService.findOne(+id);
  }

  // Только ADMIN может обновлять тип
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateTypeDto: UpdateTypeDto) {
    return this.typesService.update(+id, updateTypeDto);
  }

  // Только ADMIN может удалять тип
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.typesService.remove(+id);
  }
}
