import { propertyModel } from "../../DB/models/property.model";
import {
  FurnishingEnum,
  PropertyTypeEnum,
  TransactionTypeEnum,
} from "../../common/enums";
import {
  ISearchPageResponse,
  ISearchFilters,
  IPropertyCard,
  EnumOption,
} from "./search-page.dto";

interface SearchQuery {
  search?: string;
  transactionType?: string;
  city?: string;
  area?: string;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  furnishing?: string;
  amenities?: string | string[];
  sort?: string;
  page?: string;
  limit?: string;
}

const SORT_MAP: Record<string, any> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

// ✅ Your DB stores published properties as status = 1
const PUBLISHED_STATUS = 1;

class SearchPageService {
  async search(query: SearchQuery): Promise<ISearchPageResponse> {
    // ---------------- property filter ----------------
    const filter: Record<string, any> = {
      status: PUBLISHED_STATUS,
    };

    const toNum = (v?: string) =>
      v !== undefined && v !== "" ? Number(v) : undefined;

    const page = toNum(query.page) ?? 1;
    const limit = toNum(query.limit) ?? 12;

    // 🔍 free-text search across city / area / address
    if (query.search?.trim()) {
      const rx = new RegExp(this.escapeRegex(query.search.trim()), "i");
      filter.$or = [
        { "location.city": rx },
        { "location.area": rx },
        { "location.address": rx },
      ];
    }

    // Looking for (transaction type)
    if (query.transactionType !== undefined && query.transactionType !== "")
      filter.transactionType = Number(query.transactionType);

    // Areas (checkbox list) — supports ?area=New Cairo,Ain Sokhna
    if (query.city) {
      const cities = this.toList(query.city);
      if (cities.length === 1) {
        filter["location.city"] = new RegExp(this.escapeRegex(cities[0]), "i");
      } else if (cities.length > 1) {
        filter["location.city"] = {
          $in: cities.map((c) => new RegExp(`^${this.escapeRegex(c)}$`, "i")),
        };
      }
    }
    if (query.area) {
      const areas = this.toList(query.area);
      if (areas.length === 1) {
        filter["location.area"] = new RegExp(this.escapeRegex(areas[0]), "i");
      } else if (areas.length > 1) {
        filter["location.area"] = {
          $in: areas.map((a) => new RegExp(`^${this.escapeRegex(a)}$`, "i")),
        };
      }
    }

    // Property type (checkbox list) — supports ?propertyType=0,1
    if (query.propertyType !== undefined && query.propertyType !== "") {
      const types = this.toList(query.propertyType).map(Number);
      filter.propertyType = types.length > 1 ? { $in: types } : types[0];
    }

    // Furnishing (checkbox list)
    if (query.furnishing !== undefined && query.furnishing !== "") {
      const f = this.toList(query.furnishing).map(Number);
      filter.furnishing = f.length > 1 ? { $in: f } : f[0];
    }

    // Bedrooms / Bathrooms (chips)
    const beds = toNum(query.bedrooms);
    const baths = toNum(query.bathrooms);
    if (beds !== undefined) filter.bedrooms = { $gte: beds };
    if (baths !== undefined) filter.bathrooms = { $gte: baths };

    // Price range
    const minP = toNum(query.minPrice);
    const maxP = toNum(query.maxPrice);
    if (minP !== undefined || maxP !== undefined) {
      filter.price = {};
      if (minP !== undefined) filter.price.$gte = minP;
      if (maxP !== undefined) filter.price.$lte = maxP;
    }

    // Unit area range (numeric `area`, NOT location.area)
    const minA = toNum(query.minArea);
    const maxA = toNum(query.maxArea);
    if (minA !== undefined || maxA !== undefined) {
      filter.area = {};
      if (minA !== undefined) filter.area.$gte = minA;
      if (maxA !== undefined) filter.area.$lte = maxA;
    }

    // Amenities (multi-select) — must contain all
    if (query.amenities) {
      const list = this.toList(query.amenities);
      if (list.length) filter.amenities = { $all: list };
    }

    const skip = (page - 1) * limit;
    const sort = SORT_MAP[query.sort ?? "newest"] ?? SORT_MAP.newest;

    // ---------------- run queries in parallel ----------------
    const [docs, total, filters] = await Promise.all([
      propertyModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({ path: "category", select: "name slug icon" })
        .lean(),
      propertyModel.countDocuments(filter),
      this.getFilters(), // ✅ sidebar metadata
    ]);

    const properties: IPropertyCard[] = docs.map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      slug: p.slug ?? "",
      image: p.coverImage || p.images?.[0] || "",
      status: p.status,
      propertyType: p.propertyType,
      transactionType: p.transactionType,
      furnishing: p.furnishing,
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
    }));

    return {
      filters,
      properties,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // --------------------------------------------------------------
  // Sidebar filter metadata
  // --------------------------------------------------------------
  private async getFilters(): Promise<ISearchFilters> {
    const match = { status: PUBLISHED_STATUS };

    const [areasRaw, citiesRaw, priceAgg, areaAgg, amenitiesRaw] =
      await Promise.all([
        propertyModel.distinct("location.area", match),
        propertyModel.distinct("location.city", match),
        propertyModel.aggregate([
          { $match: match },
          { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
        ]),
        propertyModel.aggregate([
          { $match: match },
          { $group: { _id: null, min: { $min: "$area" }, max: { $max: "$area" } } },
        ]),
        propertyModel.distinct("amenities", match),
      ]);

    // Combine cities + areas into a single "Areas" list for the sidebar
    const areas = Array.from(
      new Set([...(citiesRaw as string[]), ...(areasRaw as string[])]),
    )
      .filter(Boolean)
      .sort();

    return {
      lookingFor: this.enumToOptions(TransactionTypeEnum),
      areas,
      propertyTypes: this.enumToOptions(PropertyTypeEnum),
      bedrooms: [1, 2, 3, 4, 5],
      bathrooms: [0, 1, 2, 3, 4],
      priceRange: {
        min: priceAgg[0]?.min ?? 0,
        max: priceAgg[0]?.max ?? 0,
      },
      unitAreaRange: {
        min: areaAgg[0]?.min ?? 0,
        max: areaAgg[0]?.max ?? 0,
      },
      finishing: this.enumToOptions(FurnishingEnum),
      amenities: (amenitiesRaw as string[]).filter(Boolean).sort(),
    };
  }

  private enumToOptions(
    enumObj: Record<string, string | number>,
  ): EnumOption[] {
    return Object.entries(enumObj)
      .filter(([key]) => isNaN(Number(key)))
      .map(([key, val]) => ({
        value: val as number,
        label: this.humanize(key),
      }));
  }

  private humanize(key: string): string {
    return key
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /** "a,b,c" → ["a","b","c"] */
  private toList(value: string | string[]): string[] {
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    return String(value).split(",").map((s) => s.trim()).filter(Boolean);
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

export default new SearchPageService();