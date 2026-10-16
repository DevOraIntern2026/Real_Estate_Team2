import { Types } from "mongoose";
import { propertyModel } from "../../DB/models/property.model";
import {
  IPropertyDetailsResponse,
  IReview,
  IRelatedProperty,
} from "./property-details.dto";

const PUBLISHED_STATUS = 1;

class PropertyDetailsService {
  async getById(id: string): Promise<IPropertyDetailsResponse | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const property = await propertyModel
      .findOne({ _id: id, status: PUBLISHED_STATUS })
      .populate({ path: "category", select: "name slug icon" })
      .populate({ path: "owner", select: "username email phone avatar role" })
      .lean();

    if (!property) return null;

    // ---- reviews: placeholder (no review model yet) ----
    const reviews: IReview[] = [];
    const averageRating = 0;

    // ---- related ----
    const relatedDocs = await propertyModel
      .find({
        _id: { $ne: property._id },
        status: PUBLISHED_STATUS,
        $or: [
          { "location.city": property.location?.city },
          { propertyType: property.propertyType },
        ],
      })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(3)
      .select(
        "title coverImage images status propertyType transactionType price currency bedrooms bathrooms area location",
      )
      .lean();

    const related: IRelatedProperty[] = relatedDocs.map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      image: p.coverImage || p.images?.[0] || "",
      status: p.status,
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
      },
    }));

    // ---- increment views (fire and forget) ----
    propertyModel
      .updateOne({ _id: property._id }, { $inc: { views: 1 } })
      .catch(() => {});

    return {
      _id: property._id.toString(),
      title: property.title,
      slug: property.slug ?? "",
      description: property.description,
      price: property.price,
      currency: property.currency ?? "EGP",
      transactionType: property.transactionType,
      propertyType: property.propertyType,
      status: property.status,
      isFeatured: !!property.isFeatured,
      views: (property.views ?? 0) + 1,
      createdAt: property.createdAt,

      images: property.images ?? [],
      coverImage: property.coverImage || property.images?.[0] || "",

      location: {
        address: property.location?.address ?? "",
        city: property.location?.city ?? "",
        area: property.location?.area ?? "",
        state: property.location?.state,
        country: property.location?.country ?? "Egypt",
        coordinates: property.location?.coordinates,
      },

      about: {
        bedrooms: property.bedrooms ?? 0,
        bathrooms: property.bathrooms ?? 0,
        area: property.area,
        floor: property.floor,
        furnishing: property.furnishing,
        completionYear: (property as any).completionYear,
        readyBy: (property as any).readyBy,
      },

      amenities: property.amenities ?? [],

      agent: {
        _id: (property.owner as any)?._id?.toString() ?? "",
        username: (property.owner as any)?.username ?? "",
        email: (property.owner as any)?.email ?? "",
        phone: (property.owner as any)?.phone,
        avatar: (property.owner as any)?.avatar,
        role: (property.owner as any)?.role ?? "",
      },

      reviews: {
        count: reviews.length,
        averageRating,
        items: reviews,
      },

      related,
    };
  }
}

export default new PropertyDetailsService();