import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlideController } from './slide.controller';
import { SlideService } from './slide.service';
import { Slide, Project } from '../../entities';
import { AiModule } from '../ai';

@Module({
  imports: [TypeOrmModule.forFeature([Slide, Project]), AiModule],
  controllers: [SlideController],
  providers: [SlideService],
  exports: [SlideService],
})
export class SlideModule {}
