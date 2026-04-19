import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('api-keys')
  @HttpCode(HttpStatus.CREATED)
  createApiKey(@Body() dto: CreateApiKeyDto) {
    return this.authService.createApiKey(dto);
  }
}
