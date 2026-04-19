import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /scans. Fields are optional at class-validator level so multipart
 * uploads (content from file) can pass the global ValidationPipe; JSON requests
 * must satisfy {@link parseCreateScanJsonBody}.
 */
export class CreateScanDto {
  @IsOptional()
  @IsString()
  document_name?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  content?: string;
}

/** Validates JSON-only rules and returns normalized name + content. */
export function parseCreateScanJsonBody(dto: CreateScanDto): {
  name: string;
  content: string;
} {
  if (!dto.content?.trim()) {
    throw new BadRequestException('content must not be empty');
  }
  const title = (dto.document_name ?? dto.name)?.trim();
  if (!title) {
    throw new BadRequestException(
      'document_name or name is required and must not be empty',
    );
  }
  return { name: title, content: dto.content };
}
