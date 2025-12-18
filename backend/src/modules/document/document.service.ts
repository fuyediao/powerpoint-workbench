import { Injectable, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { marked } from 'marked';
import * as XLSX from 'xlsx';

// pdf-parse has ESM/CJS compatibility issues, use require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (
  buffer: Buffer,
) => Promise<{ text: string; numpages: number }>;

@Injectable()
export class DocumentService {
  async parseDocument(file: Express.Multer.File): Promise<{ content: string }> {
    const extension = file.originalname.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'txt':
        return { content: file.buffer.toString('utf-8') };

      case 'md':
        return { content: this.parseMarkdown(file.buffer.toString('utf-8')) };

      case 'docx':
        return this.parseWord(file.buffer);

      case 'pdf':
        return this.parsePdf(file.buffer);

      case 'xlsx':
      case 'xls':
        return this.parseExcel(file.buffer);

      case 'csv':
        return this.parseCsv(file.buffer);

      default:
        throw new BadRequestException(`Unsupported file format: ${extension}`);
    }
  }

  private parseMarkdown(content: string): string {
    // Convert markdown to plain text by stripping HTML tags
    const html = marked(content) as string;
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private async parseWord(buffer: Buffer): Promise<{ content: string }> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return { content: result.value.trim() };
    } catch {
      throw new BadRequestException('Failed to parse Word document');
    }
  }

  private async parsePdf(buffer: Buffer): Promise<{ content: string }> {
    try {
      const data = await pdfParse(buffer);
      return { content: data.text.trim() };
    } catch {
      throw new BadRequestException('Failed to parse PDF document');
    }
  }

  private parseExcel(buffer: Buffer): { content: string } {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheets: string[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        });

        // Convert rows to text

        const rows = jsonData
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((row: any[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cells = row.filter((cell: any) => cell);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return cells.map((cell: any) => String(cell)).join(' | ');
          })

          .filter((row: string) => row.trim());

        if (rows.length > 0) {
          sheets.push(`[${sheetName}]\n${rows.join('\n')}`);
        }
      });

      return { content: sheets.join('\n\n') };
    } catch {
      throw new BadRequestException('Failed to parse Excel document');
    }
  }

  private parseCsv(buffer: Buffer): { content: string } {
    try {
      const text = buffer.toString('utf-8');
      const workbook = XLSX.read(text, { type: 'string' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      });

      // Convert rows to text

      const rows = jsonData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any[]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cells = row.filter((cell: any) => cell);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return cells.map((cell: any) => String(cell)).join(' | ');
        })

        .filter((row: string) => row.trim());

      return { content: rows.join('\n') };
    } catch {
      throw new BadRequestException('Failed to parse CSV document');
    }
  }
}
