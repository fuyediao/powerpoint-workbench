import { Controller, Post, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';

@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('pdf/:projectId')
  async exportPdf(
    @Param('projectId') projectId: string,
  ): Promise<{ downloadUrl: string }> {
    return this.exportService.exportToPdf(projectId);
  }

  @Get('download/:filename')
  downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): void {
    const buffer = this.exportService.getExportFile(filename);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
