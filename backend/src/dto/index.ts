import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class GenerateOutlineDto {
  @IsString()
  content: string;

  @IsNumber()
  @Min(1)
  @Max(30)
  slideCount: number;

  @IsIn(['concise', 'detailed', 'custom'])
  styleMode: 'concise' | 'detailed' | 'custom';

  @IsOptional()
  @IsString()
  customPrompt?: string;

  @IsString()
  locale: string;

  @IsOptional()
  @IsString()
  geminiApiKey?: string;

  @IsOptional()
  @IsString()
  serviceMode?: 'cloud' | 'offline';
}

export class UpdateSlideDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imagePrompt?: string;

  @IsOptional()
  @IsString()
  referenceImageUrl?: string | null;

  @IsOptional()
  @IsIn(['pending', 'generating', 'completed', 'error'])
  status?: 'pending' | 'generating' | 'completed' | 'error';
}

export class GenerateSlideImageDto {
  @IsString()
  slideId: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  referenceImageBase64?: string;

  @IsString()
  globalStyle: string;
}
