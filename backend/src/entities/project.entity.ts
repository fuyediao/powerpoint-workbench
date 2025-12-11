import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Slide } from './slide.entity';

export type StyleMode = 'concise' | 'detailed' | 'custom';

@Entity('projects')
export class Project {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  sourceContent: string;

  @Column('varchar', { length: 20 })
  styleMode: StyleMode;

  @Column('text', { nullable: true })
  customPrompt: string | null;

  @Column('int')
  slideCount: number;

  @Column('varchar', { length: 10 })
  locale: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Slide, (slide) => slide.project, { cascade: true })
  slides: Slide[];
}
