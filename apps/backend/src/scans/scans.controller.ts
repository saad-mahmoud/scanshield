import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { basename } from 'node:path';
import type { Request } from 'express';
import { ScanAuthGuard } from '../auth/scan-auth.guard';
import { WorkflowStatus } from '../entities/workflow-status.enum';
import { CreateScanDto, parseCreateScanJsonBody } from './dto/create-scan.dto';
import { ScansService } from './scans.service';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

@Controller('api/v1/scans')
@UseGuards(ScanAuthGuard)
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateScanDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;

    if (file) {
      const fileText = file.buffer.toString('utf8');
      if (!fileText.trim()) {
        throw new BadRequestException('Document content must not be empty');
      }
      const content = fileText;
      const fromField =
        typeof dto.document_name === 'string'
          ? dto.document_name.trim()
          : typeof dto.name === 'string'
            ? dto.name.trim()
            : '';
      const base = basename(file.originalname);
      const name =
        fromField ||
        (base.includes('.') ? base.replace(/\.[^.]+$/, '') : base) ||
        'document';
      return this.scansService.create(userId, { name, content });
    }

    return this.scansService.create(userId, parseCreateScanJsonBody(dto));
  }

  @Get()
  list(
    @Req() req: Request,
    @Query('status', new ParseEnumPipe(WorkflowStatus, { optional: true }))
    status?: WorkflowStatus,
  ) {
    return this.scansService.list(req.user!.id, status);
  }

  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.scansService.getScan(id, req.user!.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    await this.scansService.deleteScan(id, req.user!.id);
  }
}
