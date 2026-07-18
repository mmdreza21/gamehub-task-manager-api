import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  id: string;

  @MaxLength(20)
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'name max:20,min:3',
    default: 'new name',
  })
  name?: string;
}
