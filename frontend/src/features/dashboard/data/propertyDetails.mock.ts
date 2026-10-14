import type { Property, PropertyDetails } from "../../../types/property";
import { propertiesMock } from "./properties.mock";

type Extras = Omit<PropertyDetails, keyof Property>;

// Put 3 images in /public/images/properties/ (property-1.jpg ...) or change the URLs.
const defaults = (p: Property): Extras => ({
  submittedAt: "2026-09-21",
  updatedAt: "2026-09-21",
  images: [
    "/images/properties/property-1.jpg",
    "/images/properties/property-2.jpg",
    "/images/properties/property-3.jpg",
  ],
  description: `${p.title} located in ${p.location}, ${p.city}.`,
  bedrooms: 5,
  bathrooms: 5,
  area: 320,
  floor: "2nd",
  furnishing: "Fully Furnished",
  buildingAgeYears: 1,
  address: "Ahmed Orabi Street, Mohandessin",
  landmark: "Near the Ahmed Orabi Station",
  facilities: ["Elevator", "Air Conditioning", "Internet", "Security", "Parking"],
  nearby: ["Mosque", "Hospital", "GYM", "Garden", "Gas station", "School"],
});

const extrasById: Record<string, Partial<Extras>> = {
  p1: {
    description:
      "An exclusive, modern standalone villa located in a quiet and secure gated community. Features a spacious private garden, private swimming pool, smart home system pre-installed, high-end finishing, and panoramic windows offering great natural light. Close to main commercial hubs and international schools.",
  },
  p3: {
    rejection: {
      reason: "Incorrect Price",
      feedback: "Please confirm the listed price is correct",
    },
  },
};

export const propertyDetailsMock: PropertyDetails[] = propertiesMock.map((p) => ({
  ...defaults(p),
  ...(extrasById[p.id] ?? {}),
  ...p,
}));
