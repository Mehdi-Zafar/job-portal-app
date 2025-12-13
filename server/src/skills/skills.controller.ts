// src/skills/skills.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('skills')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /**
   * Get all skills (public)
   */
  @Get()
  @Public()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const skills = await this.skillsService.findAll(
      limit ? parseInt(limit) : 100,
      offset ? parseInt(offset) : 0,
    );

    return {
      skills,
      count: skills.length,
    };
  }

  /**
   * Search skills (public)
   */
  @Get('search')
  @Public()
  async search(
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    const skills = await this.skillsService.search(
      query || '',
      limit ? parseInt(limit) : 20,
    );

    return {
      skills,
      count: skills.length,
    };
  }

  /**
   * Get skill categories (public)
   */
  @Get('categories')
  @Public()
  async getCategories() {
    const categories = await this.skillsService.getCategories();

    return {
      categories,
      count: categories.length,
    };
  }

  /**
   * Get skills grouped by category (public)
   */
  @Get('grouped')
  @Public()
  async getGrouped() {
    const grouped = await this.skillsService.getGroupedByCategory();

    return {
      skills: grouped,
    };
  }

  /**
   * Get popular skills (public)
   */
  @Get('popular')
  @Public()
  async getPopular(@Query('limit') limit?: string) {
    const skills = await this.skillsService.getPopular(
      limit ? parseInt(limit) : 20,
    );

    return {
      skills,
      count: skills.length,
    };
  }

  /**
   * Get skill statistics (public)
   */
  @Get('statistics')
  @Public()
  async getStatistics() {
    return this.skillsService.getStatistics();
  }

  /**
   * Get skills by category (public)
   */
  @Get('category/:category')
  @Public()
  async getByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ) {
    const skills = await this.skillsService.findByCategory(
      category,
      limit ? parseInt(limit) : 50,
    );

    return {
      skills,
      count: skills.length,
      category,
    };
  }

  /**
   * Get skill by ID (public)
   */
  @Get(':id')
  @Public()
  async findById(@Param('id') id: string) {
    const skill = await this.skillsService.findById(id);

    return {
      skill,
    };
  }

  /**
   * Create skill (authenticated users can suggest, admin approves)
   */
  @Post()
  async create(@Body() createDto: CreateSkillDto) {
    const skill = await this.skillsService.create(createDto);

    return {
      message: 'Skill created successfully',
      skill,
    };
  }

  /**
   * Bulk create skills (admin only)
   */
  @Post('bulk')
  @Roles('ADMIN')
  async bulkCreate(@Body('skills') skillsData: CreateSkillDto[]) {
    const result = await this.skillsService.bulkCreate(skillsData);

    return {
      message: 'Skills created successfully',
      ...result,
    };
  }

  /**
   * Update skill (admin only)
   */
  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSkillDto,
  ) {
    const skill = await this.skillsService.update(id, updateDto);

    return {
      message: 'Skill updated successfully',
      skill,
    };
  }

  /**
   * Delete skill (admin only)
   */
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.skillsService.delete(id);
  }
}