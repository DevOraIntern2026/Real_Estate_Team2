export const propertyDetailsSwaggerTags = [
  {
    name: "Property Details",
    description: "Comprehensive public property details endpoint",
  },
];

export const propertyDetailsSwaggerPaths: Record<string, any> = {
  "/property-details/{id}": {
    get: {
      tags: ["Property Details"],
      summary: "Get full property details by ID",
      description:
        "Returns comprehensive details for a published property including media gallery, location coordinates, specs, amenities, listing agent/owner info, and related listings. Automatically increments property view count.",
      operationId: "getPublicPropertyDetails",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ObjectId of the property",
          example: "660c1b2f3a4b5c6d7e8f9a0b",
        },
      ],
      responses: {
        "200": {
          description: "Property details fetched successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        $ref: "#/components/schemas/PropertyDetailsResponse",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        "400": { description: "Invalid property ID format" },
        "404": { description: "Property not found" },
      },
    },
  },
};

export const propertyDetailsSwaggerSchemas: Record<string, any> = {
  PropertyDetailsResponse: {
    type: "object",
    properties: {
      _id: { type: "string", example: "660c1b2f3a4b5c6d7e8f9a0b" },
      title: { type: "string", example: "Luxury Villa with Private Pool" },
      slug: {
        type: "string",
        example: "luxury-villa-with-private-pool-abc123",
      },
      description: {
        type: "string",
        example:
          "Spacious standalone villa located in the heart of New Cairo featuring premium finishing, private pool and landscape garden.",
      },
      price: { type: "number", example: 12000000 },
      currency: { type: "string", example: "EGP" },
      transactionType: { type: "integer", example: 1 },
      propertyType: { type: "integer", example: 1 },
      status: { type: "integer", example: 1 },
      isFeatured: { type: "boolean", example: true },
      views: { type: "integer", example: 142 },
      createdAt: { type: "string", format: "date-time" },
      images: {
        type: "array",
        items: { type: "string" },
        example: [
          "https://res.cloudinary.com/demo/image/upload/v1/properties/img1.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1/properties/img2.jpg",
        ],
      },
      coverImage: {
        type: "string",
        example:
          "https://res.cloudinary.com/demo/image/upload/v1/properties/cover.jpg",
      },
      location: {
        type: "object",
        properties: {
          address: { type: "string", example: "Road 90, North Investors" },
          city: { type: "string", example: "Cairo" },
          area: { type: "string", example: "New Cairo" },
          country: { type: "string", example: "Egypt" },
          state: { type: "string", nullable: true },
          coordinates: {
            type: "object",
            properties: {
              lat: { type: "number", example: 30.013 },
              lng: { type: "number", example: 31.492 },
            },
          },
        },
      },
      about: {
        type: "object",
        properties: {
          bedrooms: { type: "integer", example: 4 },
          bathrooms: { type: "integer", example: 4 },
          area: { type: "number", example: 450 },
          floor: { type: "integer", nullable: true },
          furnishing: { type: "integer", example: 2 },
          completionYear: { type: "integer", nullable: true },
          readyBy: { type: "string", nullable: true },
        },
      },
      amenities: {
        type: "array",
        items: { type: "string" },
        example: ["Private Garden", "Private Pool", "Security", "Maid Room"],
      },
      agent: {
        type: "object",
        properties: {
          _id: { type: "string", example: "660c1b2f3a4b5c6d7e8f9a0c" },
          username: { type: "string", example: "ahmed_agent" },
          email: { type: "string", example: "ahmed@realestate.com" },
          phone: { type: "string", nullable: true, example: "01012345678" },
          avatar: { type: "string", nullable: true },
          role: { type: "string", example: "agent" },
        },
      },
      reviews: {
        type: "object",
        properties: {
          count: { type: "integer", example: 0 },
          averageRating: { type: "number", example: 0 },
          items: { type: "array", items: { type: "object" } },
        },
      },
      related: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPropertyCard" },
      },
    },
  },
};
