import { IProperty } from "../../common/interfaces";
import { propertyModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class PropertyRepo extends DataBaseRepo<IProperty> {
  constructor() {
    super(propertyModel);
  }
}
