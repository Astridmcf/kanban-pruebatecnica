// src/api/cards/dto/update-card.dto.ts
import {
  IsString,
  IsOptional,
  MinLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Priority } from '@prisma/client'; // Importa el Enum generado por Prisma

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
