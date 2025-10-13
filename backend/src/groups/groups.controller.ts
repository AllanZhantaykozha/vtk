import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from '../subjects/dto/subjects.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  // ---------- GROUPS ----------

  @Roles('admin')
  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    return this.groupsService.createGroup(createGroupDto, req.user);
  }

  @Roles('admin')
  @Patch(':id')
  async updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req,
  ) {
    return this.groupsService.updateGroup(id, updateGroupDto, req.user);
  }

  @Roles('admin')
  @Delete(':id')
  async deleteGroup(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.groupsService.deleteGroup(id, req.user);
  }

  // ---------- GETTERS ----------

  @Roles('admin')
  @Get()
  async getGroups(@Request() req) {
    return this.groupsService.getGroups(req.user);
  }

  @Roles('admin')
  @Get(':id')
  async getGroupById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.groupsService.getGroupById(id, req.user);
  }
}
