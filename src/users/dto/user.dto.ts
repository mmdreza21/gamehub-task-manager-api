import { ObjectId } from 'bson';
import { Expose } from 'class-transformer';

export class UserDTO {
  @Expose()
  id: string | ObjectId;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  createdAt: Date;
  updatedAt: Date;
}
