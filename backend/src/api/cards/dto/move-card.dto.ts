import { IsInt, IsMongoId, Min } from 'class-validator';

export class MoveCardDto {
  @IsMongoId()
  newColumnId: string;

  @IsInt()
  @Min(1)
  newOrder: number;
}
