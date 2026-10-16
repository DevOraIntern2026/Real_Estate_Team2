import { Types } from "mongoose";
import {
  FurnishingEnum,
  PropertyStatusEnum,
  PropertyTypeEnum,
  TransactionTypeEnum,
} from "../enums";

export interface ILocation {
  address: string;
  city: string;
  area: string;
  state?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IProperty {
  title: string;
  slug?: string;
  description: string;
  category: Types.ObjectId;
  propertyType: PropertyTypeEnum;
  transactionType: TransactionTypeEnum;
  price: number;
  currency?: string;
  area: number; // in square meters
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  furnishing?: FurnishingEnum;
  amenities?: string[];
  location: ILocation;
  images?: string[];
  imagePublicIds?: string[];
  coverImage?: string;
  owner: Types.ObjectId;
  status: PropertyStatusEnum;
  rejectionReason?: string;
  views?: number;
  isFeatured?: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  paranoid?: boolean;
  deletedAt?: Date;
  restoredAt?: Date;
}

export interface ICategory {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  paranoid?: boolean;
  deletedAt?: Date;
  restoredAt?: Date;
}
