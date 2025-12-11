import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('api/document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('parse')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        const allowedMimes = [
          'text/plain',
          'text/markdown',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        const allowedExtensions = ['txt', 'md', 'pdf', 'docx'];
        const extension = file.originalname.split('.').pop()?.toLowerCase();

        if (
          allowedMimes.includes(file.mimetype) ||
          (extension && allowedExtensions.includes(extension))
        ) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async parseDocument(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ content: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.documentService.parseDocument(file);
  }
}
