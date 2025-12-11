import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slide, Project } from '../../entities';
import { AiService } from '../ai';
import { UpdateSlideDto, GenerateSlideImageDto } from '../../dto';

@Injectable()
export class SlideService {
  constructor(
    @InjectRepository(Slide)
    private slideRepo: Repository<Slide>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private aiService: AiService,
  ) {}

  async getSlide(id: string): Promise<Slide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) {
      throw new NotFoundException(`Slide ${id} not found`);
    }
    return slide;
  }

  async updateSlide(id: string, dto: UpdateSlideDto): Promise<Slide> {
    const slide = await this.getSlide(id);

    if (dto.title !== undefined) slide.title = dto.title;
    if (dto.content !== undefined) slide.content = dto.content;
    if (dto.imagePrompt !== undefined) slide.imagePrompt = dto.imagePrompt;
    if (dto.referenceImageUrl !== undefined)
      slide.referenceImageUrl = dto.referenceImageUrl;
    if (dto.status !== undefined) slide.status = dto.status;

    await this.slideRepo.save(slide);
    return slide;
  }

  async generateSlideImage(
    dto: GenerateSlideImageDto,
  ): Promise<{ imageUrl: string }> {
    const slide = await this.getSlide(dto.slideId);

    // Update status to generating
    slide.status = 'generating';
    await this.slideRepo.save(slide);

    try {
      // Generate image using AI
      const imageUrl = await this.aiService.generateSlideImage(
        dto.prompt,
        dto.globalStyle,
        dto.referenceImageBase64,
      );

      // Update slide with generated image
      slide.imageUrl = imageUrl;
      slide.status = 'completed';
      await this.slideRepo.save(slide);

      return { imageUrl };
    } catch (error) {
      // Update status to error
      slide.status = 'error';
      await this.slideRepo.save(slide);
      throw error;
    }
  }

  async getSlidesByProject(projectId: string): Promise<Slide[]> {
    return this.slideRepo.find({
      where: { projectId },
      order: { pageNumber: 'ASC' },
    });
  }
}
