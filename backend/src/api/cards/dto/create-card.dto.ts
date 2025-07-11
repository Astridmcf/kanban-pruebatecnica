import { IsNotEmpty, IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsMongoId() // Valida que sea un ID válido de MongoDB
  columnId: string;
}
