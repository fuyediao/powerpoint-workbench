import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
} from '@google/generative-ai';
import type { StyleMode } from '../../entities';

interface SlideOutline {
  title: string;
  content: string;
  imagePrompt: string;
}

interface OutlineResult {
  projectTitle: string;
  slides: SlideOutline[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private textModel: GenerativeModel;
  private imageModel: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.textModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
    this.imageModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp-image-generation',
    });
  }

  async generateOutline(
    content: string,
    slideCount: number,
    styleMode: StyleMode,
    customPrompt: string | undefined,
    locale: string,
    apiKey?: string,
  ): Promise<OutlineResult> {
    const styleDescription = this.getStyleDescription(styleMode, customPrompt);
    const languageInstruction = this.getLanguageInstruction(locale);

    const prompt = `You are an expert presentation designer. Analyze the following content and create a structured outline for a ${slideCount}-slide presentation.

Style requirements: ${styleDescription}

${languageInstruction}

Content to analyze:
---
${content.substring(0, 15000)}
---

Create a JSON response with the following structure:
{
  "projectTitle": "A concise title for the entire presentation",
  "slides": [
    {
      "title": "Slide title",
      "content": "Key points for this slide, formatted as bullet points or short paragraphs",
      "imagePrompt": "A detailed prompt for generating an illustration for this slide. The prompt should describe the visual elements, style, colors, and composition that would complement the slide content. Make it suitable for AI image generation."
    }
  ]
}

Important:
- Generate exactly ${slideCount} slides
- Each slide should have clear, focused content
- Image prompts should be detailed and descriptive for AI image generation
- Maintain a logical flow between slides
- Return ONLY valid JSON, no markdown formatting`;

    try {
      // Use provided API key or fallback to configured one
      const effectiveApiKey =
        apiKey || this.configService.get<string>('GEMINI_API_KEY');
      if (!effectiveApiKey) {
        throw new Error(
          'Gemini API key is required. Please configure it in settings.',
        );
      }

      // Create a new instance with the provided API key if different
      const genAI =
        effectiveApiKey !== this.configService.get<string>('GEMINI_API_KEY')
          ? new GoogleGenerativeAI(effectiveApiKey)
          : this.genAI;
      const textModel =
        effectiveApiKey !== this.configService.get<string>('GEMINI_API_KEY')
          ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
          : this.textModel;

      const result = await textModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse outline response');
      }

      const outline = JSON.parse(jsonMatch[0]) as OutlineResult;
      return outline;
    } catch (error) {
      this.logger.error('Failed to generate outline:', error);
      throw error;
    }
  }

  async polishPrompt(userPrompt: string, locale: string): Promise<string> {
    const languageInstruction = this.getLanguageInstruction(locale);

    const prompt = `You are an expert at creating prompts for AI image generation models.
Polish and enhance the following design requirement into a professional, detailed prompt suitable for generating presentation slide images.

${languageInstruction}

User's design requirement: "${userPrompt}"

Create a polished prompt that:
- Describes the visual style clearly (colors, typography, layout)
- Specifies the mood and atmosphere
- Includes technical details (aspect ratio 16:9, high quality, professional)
- Is suitable for consistent application across multiple slides

Return ONLY the polished prompt text, no explanations.`;

    try {
      const result = await this.textModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.error('Failed to polish prompt:', error);
      return userPrompt;
    }
  }

  async generateSlideImage(
    slidePrompt: string,
    globalStyle: string,
    referenceImageBase64?: string,
  ): Promise<string> {
    const fullPrompt = `Create a professional presentation slide image with the following specifications:

Global Style: ${globalStyle}

Slide Content/Theme: ${slidePrompt}

Requirements:
- Aspect ratio: 16:9 (widescreen presentation format)
- Professional, clean design suitable for business presentations
- High quality, crisp graphics
- Readable text areas if any text is included
- Consistent with modern presentation aesthetics`;

    try {
      const parts: Part[] = [{ text: fullPrompt }];

      // Add reference image if provided
      if (referenceImageBase64) {
        const base64Data = referenceImageBase64.replace(
          /^data:image\/\w+;base64,/,
          '',
        );
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Data,
          },
        });
      }

      const result = await this.imageModel.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseModalities: ['Text', 'Image'],
        } as Record<string, unknown>,
      });

      const response = result.response;
      const candidates = response.candidates;

      if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        if (content && content.parts) {
          for (const part of content.parts) {
            const partData = part as {
              inlineData?: { mimeType: string; data: string };
            };
            if (partData.inlineData) {
              const base64 = partData.inlineData.data;
              const mimeType = partData.inlineData.mimeType;
              return `data:${mimeType};base64,${base64}`;
            }
          }
        }
      }

      throw new Error('No image generated in response');
    } catch (error) {
      this.logger.error('Failed to generate slide image:', error);
      throw error;
    }
  }

  private getStyleDescription(
    styleMode: StyleMode,
    customPrompt: string | undefined,
  ): string {
    switch (styleMode) {
      case 'concise':
        return 'Concise presentation style - focus on key points, minimal text, visual emphasis. Suitable for live presentations where the speaker provides context.';
      case 'detailed':
        return 'Detailed presentation style - comprehensive content, full explanations, suitable for standalone reading or documentation.';
      case 'custom':
        return customPrompt || 'Professional presentation style';
      default:
        return 'Professional presentation style';
    }
  }

  private getLanguageInstruction(locale: string): string {
    switch (locale) {
      case 'zh-CN':
        return 'Generate all content in Simplified Chinese (简体中文).';
      case 'zh-TW':
        return 'Generate all content in Traditional Chinese (繁體中文).';
      default:
        return 'Generate all content in English.';
    }
  }
}
