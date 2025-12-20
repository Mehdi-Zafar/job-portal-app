// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsArray, ArrayMinSize, IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

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
  @IsEnum(Role, { each: true })
  roles: Role[];
}