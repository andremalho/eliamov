import { IsNumber, IsString, Min } from 'class-validator';

export class AddXpDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  action: string;
}
