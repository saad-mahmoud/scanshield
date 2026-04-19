import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateApiKeyDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
