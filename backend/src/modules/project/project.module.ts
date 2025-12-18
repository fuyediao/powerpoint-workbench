import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project, Slide } from '../../entities';
import { AiModule } from '../ai';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Slide]), AiModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
