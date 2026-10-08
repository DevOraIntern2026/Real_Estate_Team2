import { GenderEnum, ProviderEnums, RoleEnum } from "../enums";

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
  // friends?: Types.ObjectId[] | IUser[];
  tokenVersion?: number;
  provider: ProviderEnums;
  profileImage?: string;
  coverImages?: string[];
  role: RoleEnum;
  gender: GenderEnum;
  createdAt?: Date;
  updatedAt?: Date;
  paranoid?: boolean;
  confirmedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  changedCredentialsTime?: Date;
}
