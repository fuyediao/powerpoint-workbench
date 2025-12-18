import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Project, Slide } from './entities';
import { DocumentModule } from './modules/document';
import { ProjectModule } from './modules/project';
import { SlideModule } from './modules/slide';
import { AiModule } from './modules/ai';
import { ExportModule } from './modules/export';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'ppt-workbench.db',
      entities: [Project, Slide],
      synchronize: true, // Auto-create tables in development
    }),
    DocumentModule,
    ProjectModule,
    SlideModule,
    AiModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
