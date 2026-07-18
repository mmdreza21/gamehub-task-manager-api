export enum Role {
  AdminOfSite = 'AdminOfSite',
  User = 'User',
  Seller = 'Seller',
}
export class UserEntity {
  id: string;
  role: Role;
  name: string;
  phone: string | null;
  addresses: Array<string>;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  resetPassToken: string | null;
  dateOfToken: Date | null;
}
