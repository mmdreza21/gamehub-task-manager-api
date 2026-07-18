import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class UserSignUpDTO {
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'your name max:20,min:3',
    default: 'test',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    description: 'an email address contain ~~@~~.com',
    default: 'test',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  @ApiProperty({
    type: String,
    description:
      'password  most have at least 6 character with a {lower case} and an {upper case} word',
    default: '123Asd',
  })
  password: string;

  role?: Role;
}
