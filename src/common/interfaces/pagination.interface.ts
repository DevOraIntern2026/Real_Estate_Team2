import { HydratedDocument } from "mongoose";

export interface IPaginate<TRawDoc> {
  currentPage?: number | undefined;
  size?: number | undefined;
  pages?: number | undefined;
  docs: HydratedDocument<TRawDoc>[];
}
