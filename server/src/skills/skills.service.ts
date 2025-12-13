// src/skills/skills.service.ts
import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DATABASE_CONNECTION, type Database } from '../database/database.providers';
import { skills } from '../database/schema';
import { eq, ilike, or, and, sql } from 'drizzle-orm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  /**
   * Create new skill
   */
  async create(createDto: CreateSkillDto) {
    // Check if skill already exists
    const existing = await this.findByName(createDto.name);

    if (existing) {
      throw new ConflictException('Skill already exists');
    }

    const [skill] = await this.db
      .insert(skills)
      .values({
        name: createDto.name,
        category: createDto.category || 'General',
      })
      .returning();

    return skill;
  }

  /**
   * Find all skills
   */
  async findAll(limit: number = 100, offset: number = 0) {
    const allSkills = await this.db
      .select()
      .from(skills)
      .limit(limit)
      .offset(offset)
      .orderBy(skills.name);

    return allSkills;
  }

  /**
   * Find skill by ID
   */
  async findById(id: string) {
    const result = await this.db
      .select()
      .from(skills)
      .where(eq(skills.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find skill by name
   */
  async findByName(name: string) {
    const result = await this.db
      .select()
      .from(skills)
      .where(eq(skills.name, name))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Search skills by query
   */
  async search(query: string, limit: number = 20) {
    if (!query) {
      return this.findAll(limit);
    }

    const results = await this.db
      .select()
      .from(skills)
      .where(ilike(skills.name, `%${query}%`))
      .limit(limit)
      .orderBy(skills.name);

    return results;
  }

  /**
   * Find skills by category
   */
  async findByCategory(category: string, limit: number = 50) {
    const results = await this.db
      .select()
      .from(skills)
      .where(eq(skills.category, category))
      .limit(limit)
      .orderBy(skills.name);

    return results;
  }

  /**
   * Get all skill categories
   */
  async getCategories() {
    const categories = await this.db
      .selectDistinct({ category: skills.category })
      .from(skills)
      .orderBy(skills.category);

    return categories.map((c) => c.category).filter((c) => c !== null);
  }

  /**
   * Get skills grouped by category
   */
  async getGroupedByCategory() {
    const allSkills = await this.findAll(1000);

    const grouped = allSkills.reduce((acc, skill) => {
      const category = skill.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, typeof allSkills>);

    return grouped;
  }

  /**
   * Update skill
   */
  async update(id: string, updateDto: UpdateSkillDto) {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Skill not found');
    }

    // Check if new name conflicts with another skill
    if (updateDto.name && updateDto.name !== existing.name) {
      const nameExists = await this.findByName(updateDto.name);
      if (nameExists) {
        throw new ConflictException('Skill with this name already exists');
      }
    }

    const [updated] = await this.db
      .update(skills)
      .set(updateDto)
      .where(eq(skills.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete skill
   */
  async delete(id: string) {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Skill not found');
    }

    await this.db.delete(skills).where(eq(skills.id, id));

    return { message: 'Skill deleted successfully' };
  }

  /**
   * Get popular skills (most used)
   */
  async getPopular(limit: number = 20) {
    // This requires joining with applicantSkills and jobRequiredSkills
    // For now, return all skills ordered by name
    // TODO: Implement proper popularity tracking
    return this.findAll(limit);
  }

  /**
   * Find or create skill (used internally)
   */
  async findOrCreate(name: string, category?: string) {
    let skill = await this.findByName(name);

    if (!skill) {
      skill = await this.create({
        name,
        category: category || 'General',
      });
    }

    return skill;
  }

  /**
   * Bulk create skills
   */
  async bulkCreate(skillsData: CreateSkillDto[]) {
    const createdSkills:CreateSkillDto[] = [];
    const errors:any[] = [];

    for (const skillData of skillsData) {
      try {
        const skill = await this.findOrCreate(
          skillData.name,
          skillData.category,
        );
        createdSkills.push(skill);
      } catch (error) {
        errors.push({
          skill: skillData.name,
          error: error.message,
        });
      }
    }

    return {
      created: createdSkills,
      errors,
    };
  }

  /**
   * Get skill statistics
   */
  async getStatistics() {
    const totalSkills = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(skills);

    const categories = await this.getCategories();

    return {
      totalSkills: totalSkills[0]?.count || 0,
      totalCategories: categories.length,
      categories,
    };
  }
}