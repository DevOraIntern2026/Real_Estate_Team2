import { propertyModel } from "../../DB/models/property.model";
import {
  PropertyTypeEnum,
  TransactionTypeEnum,
} from "../../common/enums";
import {
  ILandingPageResponse,
  IPropertyCard,
  ICityCard,
  EnumOption,
} from "./landing-page.dto";

class LandingPageService {
  async getLandingPageData(): Promise<ILandingPageResponse> {
    // ✅ Return EVERY property (no status filter)
    // If you want only published, uncomment the status line below.
    const publicFilter: any = {
      deletedAt: { $exists: false },
      // status: PropertyStatusEnum.PUBLISHED,
    };

    // ---- Discover Properties ----
    let discoverProperties = await propertyModel
      .find({ ...publicFilter, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate({ path: "category", select: "name slug icon" })
      .lean();

    if (discoverProperties.length === 0) {
      discoverProperties = await propertyModel
        .find(publicFilter)
        .sort({ createdAt: -1 })
        .limit(4)
        .populate({ path: "category", select: "name slug icon" })
        .lean();
    }

    // ---- Top Recommended ----
    let topRecommended = await propertyModel
      .find({ ...publicFilter, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({ path: "category", select: "name slug icon" })
      .lean();

    if (topRecommended.length === 0) {
      topRecommended = await propertyModel
        .find(publicFilter)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate({ path: "category", select: "name slug icon" })
        .lean();
    }

    // ---- Cities ----
    const citiesAgg = await propertyModel.aggregate<ICityCard>([
      { $match: publicFilter },
      { $group: { _id: "$location.city", propertiesCount: { $sum: 1 } } },
      { $match: { _id: { $nin: [null, ""] } } },
      { $sort: { propertiesCount: -1 } },
      { $limit: 4 },
      {
        $project: {
          _id: 0,
          name: "$_id",
          image: { $literal: "" },
          propertiesCount: 1,
        },
      },
    ]);

    const totalProperties = await propertyModel.countDocuments(publicFilter);

    const mapProperty = (p: any): IPropertyCard => ({
      _id: p._id.toString(),
      title: p.title,
      slug: p.slug ?? "",
      image: p.coverImage || p.images?.[0] || "",
      propertyType: p.propertyType,
      transactionType: p.transactionType,
      price: p.price,
      currency: p.currency ?? "EGP",
      bedrooms: p.bedrooms ?? 0,
      bathrooms: p.bathrooms ?? 0,
      area: p.area,
      location: {
        city: p.location?.city ?? "",
        area: p.location?.area ?? "",
        address: p.location?.address ?? "",
      },
      isFeatured: !!p.isFeatured,
    });

    return {
      totalProperties,
      filters: {
        transactionTypes: this.enumToOptions(TransactionTypeEnum),
        propertyTypes: this.enumToOptions(PropertyTypeEnum),
        bedrooms: [1, 2, 3, 4, 5],
      },
      discoverProperties: discoverProperties.map(mapProperty),
      cities: citiesAgg,
      topRecommended: topRecommended.map(mapProperty),
    };
  }

  private enumToOptions(
    enumObj: Record<string, string | number>,
  ): EnumOption[] {
    return Object.entries(enumObj)
      .filter(([key]) => isNaN(Number(key)))
      .map(([key, val]) => ({
        value: val as number,
        label: key.toLowerCase(),
      }));
  }

  async debugData() {
    const totalInDb = await propertyModel.countDocuments({});
    const published = await propertyModel.countDocuments({ status: 1 });
    const featured = await propertyModel.countDocuments({ isFeatured: true });

    const sample = await propertyModel
      .find({})
      .limit(5)
      .select(
        "title status isFeatured location.city images coverImage deletedAt",
      )
      .lean();

    return { totalInDb, publishedCount: published, featuredCount: featured, sample };
  }
}

export default new LandingPageService();