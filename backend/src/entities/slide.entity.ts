import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export type SlideStatus = 'pending' | 'generating' | 'completed' | 'error';

@Entity('slides')
export class Slide {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  projectId: string;

  @Column('int')
  pageNumber: number;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column('text')
  imagePrompt: string;

  @Column('text', { nullable: true })
  imageUrl: string | null;

  @Column('text', { nullable: true })
  referenceImageUrl: string | null;

  @Column('varchar', { length: 20, default: 'pending' })
  status: SlideStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.slides, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
