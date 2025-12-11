import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Project, Slide, StyleMode } from '../../entities';
import { AiService } from '../ai';
import { GenerateOutlineDto } from '../../dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Slide)
    private slideRepo: Repository<Slide>,
    private aiService: AiService,
  ) {}

  async generateOutline(dto: GenerateOutlineDto): Promise<Project> {
    // Use AI to generate outline
    const outline = await this.aiService.generateOutline(
      dto.content,
      dto.slideCount,
      dto.styleMode as StyleMode,
      dto.customPrompt,
      dto.locale,
      dto.geminiApiKey,
    );

    // Polish custom prompt if provided
    let polishedPrompt = dto.customPrompt || null;
    if (dto.styleMode === 'custom' && dto.customPrompt) {
      polishedPrompt = await this.aiService.polishPrompt(
        dto.customPrompt,
        dto.locale,
      );
    }

    // Create project
    const projectId = uuidv4();
    const project = this.projectRepo.create({
      id: projectId,
      title: outline.projectTitle,
      sourceContent: dto.content,
      styleMode: dto.styleMode as StyleMode,
      customPrompt: polishedPrompt,
      slideCount: dto.slideCount,
      locale: dto.locale,
    });

    await this.projectRepo.save(project);

    // Create slides
    const slides: Slide[] = [];
    for (let i = 0; i < outline.slides.length; i++) {
      const slideData = outline.slides[i];
      const slide = this.slideRepo.create({
        id: uuidv4(),
        projectId: projectId,
        pageNumber: i + 1,
        title: slideData.title,
        content: slideData.content,
        imagePrompt: slideData.imagePrompt,
        status: 'pending',
      });
      slides.push(slide);
    }

    await this.slideRepo.save(slides);

    // Return project with slides
    return this.getProject(projectId);
  }

  async getProject(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['slides'],
      order: { slides: { pageNumber: 'ASC' } },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const result = await this.projectRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }
}
