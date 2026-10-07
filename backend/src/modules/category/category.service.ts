import { CategoryRepo } from "../../DB/repo/category.repo";
import { PropertyRepo } from "../../DB/repo/property.repo";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions";
import { ICategory } from "../../common/interfaces";
import { CreateCategoryDto, ListCategoriesDto, UpdateCategoryDto } from "./category.dto";
import { Types } from "mongoose";

class CategoryService {
  private readonly categoryRepo: CategoryRepo;
  private readonly propertyRepo: PropertyRepo;

  constructor() {
    this.categoryRepo = new CategoryRepo();
    this.propertyRepo = new PropertyRepo();
  }

  async create(data: CreateCategoryDto): Promise<ICategory> {
    const existing = await this.categoryRepo.findOne({
      filter: { name: new RegExp(`^${data.name.trim()}$`, "i") },
      options: { lean: true },
    });
    if (existing) {
      throw new ConflictException("A category with this name already exists");
    }
    return this.categoryRepo.createOne({ data });
  }

  async list({ page, limit, search, isActive }: ListCategoriesDto) {
    const filter: Record<string, unknown> = {};
    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (search) filter.$text = { $search: search };

    return this.categoryRepo.paginate({
      filter,
      page,
      limit,
      options: { sort: { createdAt: -1 } },
    });
  }

  async getById(id: string): Promise<ICategory> {
    const category = await this.categoryRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async update(id: string, data: UpdateCategoryDto): Promise<ICategory> {
    if (data.name) {
      const duplicate = await this.categoryRepo.findOne({
        filter: {
          _id: { $ne: new Types.ObjectId(id) },
          name: new RegExp(`^${data.name.trim()}$`, "i"),
        },
        options: { lean: true },
      });
      if (duplicate) {
        throw new ConflictException("A category with this name already exists");
      }
    }
    const category = await this.categoryRepo.findOneAndUpdate({
      filter: { _id: new Types.ObjectId(id) },
      update: data,
    });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  // Soft delete: this repo's schema hooks route a plain updateOne with
  // `deletedAt` set into a soft delete, keeping the record recoverable.
  async remove(id: string): Promise<void> {
    const inUse = await this.propertyRepo.findOne({
      filter: { category: new Types.ObjectId(id) },
      projection: "_id",
      options: { lean: true },
    });
    if (inUse) {
      throw new BadRequestException(
        "This category still has properties assigned to it and can't be deleted",
      );
    }
    const result = await this.categoryRepo.updateOne({
      filter: { _id: new Types.ObjectId(id) },
      update: { deletedAt: new Date() },
    });
    if (!result.matchedCount) throw new NotFoundException("Category not found");
  }
}

export default new CategoryService();
