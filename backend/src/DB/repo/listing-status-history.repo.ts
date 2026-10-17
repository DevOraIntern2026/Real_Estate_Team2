import { IListingStatusHistory } from "../../common/interfaces";
import { listingStatusHistoryModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class ListingStatusHistoryRepo extends DataBaseRepo<IListingStatusHistory> {
  constructor() {
    super(listingStatusHistoryModel);
  }
}
