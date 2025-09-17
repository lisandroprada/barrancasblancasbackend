import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsSelfOrAdmin } from '../auth/is-self-or-admin.decorator';
import { IsSelfOrAdminGuard } from '../auth/is-self-or-admin.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.userService.findAll();
  }

  @Get('assignable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin can get the list of assignable users
  findAssignable() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.userService.findAssignableUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, IsSelfOrAdminGuard) // Apply JwtAuthGuard first, then IsSelfOrAdminGuard
  @IsSelfOrAdmin() // Apply the decorator to enable the guard's logic
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsSelfOrAdminGuard) // Apply JwtAuthGuard first, then IsSelfOrAdminGuard
  @IsSelfOrAdmin() // Apply the decorator to enable the guard's logic
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
