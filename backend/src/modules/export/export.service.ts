import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { Project, Slide } from '../../entities';

@Injectable()
export class ExportService {
  private readonly exportDir = path.join(process.cwd(), 'exports');

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Slide)
    private slideRepo: Repository<Slide>,
  ) {
    // Ensure export directory exists
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  async exportToPdf(projectId: string): Promise<{ downloadUrl: string }> {
    // Get project with slides
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['slides'],
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // Sort slides by page number
    const slides = project.slides.sort((a, b) => a.pageNumber - b.pageNumber);

    // Check if all slides have images
    const incompleteSlides = slides.filter(
      (s) => s.status !== 'completed' || !s.imageUrl,
    );
    if (incompleteSlides.length > 0) {
      throw new BadRequestException(
        `${incompleteSlides.length} slides are not yet completed. Please generate all slide images first.`,
      );
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();

    // 16:9 aspect ratio at 72 DPI (typical PDF)
    const pageWidth = 1280;
    const pageHeight = 720;

    for (const slide of slides) {
      if (!slide.imageUrl) continue;

      try {
        // Extract image data from base64
        const base64Data = slide.imageUrl.replace(
          /^data:image\/\w+;base64,/,
          '',
        );
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Determine image type and embed
        let image;
        if (slide.imageUrl.includes('image/png')) {
          image = await pdfDoc.embedPng(imageBuffer);
        } else {
          image = await pdfDoc.embedJpg(imageBuffer);
        }

        // Add page
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Draw image to fill page
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      } catch (error) {
        console.error(
          `Failed to embed image for slide ${slide.pageNumber}:`,
          error,
        );
        // Add blank page on error
        pdfDoc.addPage([pageWidth, pageHeight]);
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const filename = `${project.id}-${Date.now()}.pdf`;
    const filepath = path.join(this.exportDir, filename);

    fs.writeFileSync(filepath, pdfBytes);

    return {
      downloadUrl: `/api/export/download/${filename}`,
    };
  }

  getExportFile(filename: string): Buffer {
    const filepath = path.join(this.exportDir, filename);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Export file not found');
    }

    return fs.readFileSync(filepath);
  }

  // Clean up old export files (call periodically)
  cleanupOldExports(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const files = fs.readdirSync(this.exportDir);
    const now = Date.now();

    for (const file of files) {
      const filepath = path.join(this.exportDir, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAgeMs) {
        fs.unlinkSync(filepath);
      }
    }
  }
}
