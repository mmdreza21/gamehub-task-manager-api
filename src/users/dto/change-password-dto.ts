import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty({ example: 'oldPassword123', description: 'Current password' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'newPassword456', description: 'New password' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
