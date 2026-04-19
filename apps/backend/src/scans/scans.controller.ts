import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { DocumentsService } from '../documents/documents.service';
import { CreateDocumentDto } from '../documents/dto/create-document.dto';
import { ScansService } from './scans.service';

@Controller('api/v1/scans')
@UseGuards(ApiKeyAuthGuard)
export class ScansController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly scansService: ScansService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDocumentDto, @Req() req: Request) {
    return this.documentsService.create(dto, req.user!.id);
  }

  @Get()
  list(@Req() req: Request) {
    return this.scansService.list(req.user!.id);
  }

  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.scansService.getScan(id, req.user!.id);
  }
}
