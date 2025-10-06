import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AdminInfo,
  CreateUserDto,
  StudentInfo,
  TeacherInfo,
} from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMe(@Request() req): Promise<TeacherInfo | StudentInfo | AdminInfo> {
    return this.usersService.getUserInfo(req.user.userId, req.user.role);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAll() {
    return this.usersService.getAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
