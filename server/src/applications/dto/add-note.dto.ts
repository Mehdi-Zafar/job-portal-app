// src/applications/dto/add-note.dto.ts
import { IsString } from 'class-validator';

export class AddNoteDto {
  @IsString()
  notes: string;
}