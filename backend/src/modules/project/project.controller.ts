import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { GenerateOutlineDto } from '../../dto';
import { Project } from '../../entities';

@Controller('api/project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('generate-outline')
  async generateOutline(
    @Body(new ValidationPipe({ transform: true })) dto: GenerateOutlineDto,
  ): Promise<Project> {
    return this.projectService.generateOutline(dto);
  }

  @Get(':id')
  async getProject(@Param('id') id: string): Promise<Project> {
    return this.projectService.getProject(id);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.projectService.deleteProject(id);
    return { success: true };
  }
}
