import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-F]{3}){1,2}$/i, {
    message: 'El color debe ser un código hexadecimal válido (ej. #RRGGBB)',
  })
  color?: string;
}
