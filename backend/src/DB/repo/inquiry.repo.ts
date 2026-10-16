import { IInquiry } from "../../common/interfaces";
import { inquiryModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class InquiryRepo extends DataBaseRepo<IInquiry> {
  constructor() {
    super(inquiryModel);
  }
}
