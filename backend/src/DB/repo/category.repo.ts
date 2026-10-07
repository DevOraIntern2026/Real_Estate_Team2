import { ICategory } from "../../common/interfaces";
import { categoryModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class CategoryRepo extends DataBaseRepo<ICategory> {
  constructor() {
    super(categoryModel);
  }
}
