export const landingPageSwaggerTags = [
  {
    name: "Landing Page",
    description: "Public landing page aggregation endpoint",
  },
];

export const landingPageSwaggerPaths: Record<string, any> = {
  "/landingPage": {
    get: {
      tags: ["Landing Page"],
      summary: "Get landing page data",
      description:
        "Public endpoint that aggregates featured discover properties, top recommended listings, top cities with listing counts, total property count, and available search filter categories.",
      operationId: "getLandingPageData",
      responses: {
        "200": {
          description: "Landing page data fetched successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/LandingPageResponse" },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
};

export const landingPageSwaggerSchemas: Record<string, any> = {
  LandingPageResponse: {
    type: "object",
    properties: {
      totalProperties: { type: "integer", example: 120 },
      filters: {
        type: "object",
        properties: {
          transactionTypes: {
            type: "array",
            items: { $ref: "#/components/schemas/LandingEnumOption" },
          },
          propertyTypes: {
            type: "array",
            items: { $ref: "#/components/schemas/LandingEnumOption" },
          },
          bedrooms: {
            type: "array",
            items: { type: "integer" },
            example: [1, 2, 3, 4, 5],
          },
        },
      },
      discoverProperties: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPropertyCard" },
      },
      cities: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingCityCard" },
      },
      topRecommended: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPropertyCard" },
      },
    },
  },
  LandingEnumOption: {
    type: "object",
    properties: {
      value: { type: "integer", example: 0 },
      label: { type: "string", example: "rent" },
    },
  },
  LandingCityCard: {
    type: "object",
    properties: {
      name: { type: "string", example: "Cairo" },
      image: { type: "string", example: "" },
      propertiesCount: { type: "integer", example: 45 },
    },
  },
  LandingPropertyCard: {
    type: "object",
    properties: {
      _id: { type: "string", example: "660c1b2f3a4b5c6d7e8f9a0b" },
      title: { type: "string", example: "Modern 3BR Apartment in New Cairo" },
      slug: {
        type: "string",
        example: "modern-3br-apartment-in-new-cairo-123456",
      },
      image: {
        type: "string",
        example:
          "https://res.cloudinary.com/demo/image/upload/v1/properties/cover.jpg",
      },
      propertyType: {
        type: "integer",
        description: "0: Apartment, 1: Villa, etc.",
        example: 0,
      },
      transactionType: {
        type: "integer",
        description: "0: Rent, 1: Sale",
        example: 1,
      },
      price: { type: "number", example: 4500000 },
      currency: { type: "string", example: "EGP" },
      bedrooms: { type: "integer", example: 3 },
      bathrooms: { type: "integer", example: 2 },
      area: { type: "number", example: 180 },
      location: {
        type: "object",
        properties: {
          city: { type: "string", example: "Cairo" },
          area: { type: "string", example: "New Cairo" },
          address: { type: "string", example: "5th Settlement" },
        },
      },
      isFeatured: { type: "boolean", example: true },
    },
  },
};
