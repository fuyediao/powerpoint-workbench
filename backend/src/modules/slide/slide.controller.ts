import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { SlideService } from './slide.service';
import { UpdateSlideDto, GenerateSlideImageDto } from '../../dto';
import { Slide } from '../../entities';

@Controller('api/slide')
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  @Get(':id')
  async getSlide(@Param('id') id: string): Promise<Slide> {
    return this.slideService.getSlide(id);
  }

  @Patch(':id')
  async updateSlide(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateSlideDto,
  ): Promise<Slide> {
    return this.slideService.updateSlide(id, dto);
  }

  @Post('generate-image')
  async generateImage(
    @Body(new ValidationPipe({ transform: true })) dto: GenerateSlideImageDto,
  ): Promise<{ imageUrl: string }> {
    return this.slideService.generateSlideImage(dto);
  }
}
