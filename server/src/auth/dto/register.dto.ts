// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsArray, ArrayMinSize } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(5)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsArray()
  @ArrayMinSize(1)
  roles: string[];
}