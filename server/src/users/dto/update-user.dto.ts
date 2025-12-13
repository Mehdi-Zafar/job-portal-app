// src/users/dto/update-user.dto.ts
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  username?: string;
}