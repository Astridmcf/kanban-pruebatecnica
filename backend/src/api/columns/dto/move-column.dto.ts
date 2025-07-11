import { IsInt, Min } from 'class-validator';

export class MoveColumnDto {
  @IsInt()
  @Min(1)
  newOrder: number;
}
