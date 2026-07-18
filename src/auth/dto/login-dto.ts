import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    description: 'write your email',
    default: 'm@m.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'write your password',
    default: '123Asd',
  })
  password: string;
}
