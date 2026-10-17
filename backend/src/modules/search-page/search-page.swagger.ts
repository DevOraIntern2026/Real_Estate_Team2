export const searchPageSwaggerTags = [
  {
    name: "Search Page",
    description:
      "Public search and multi-criteria filtering for properties with dynamic filters metadata",
  },
];

export const searchPageSwaggerPaths: Record<string, any> = {
  "/search": {
    get: {
      tags: ["Search Page"],
      summary: "Search and filter properties",
      description:
        "Public property search with keyword query, multi-faceted filters (transaction type, property type, location, price, beds/baths, area, furnishing, amenities), dynamic sidebar metadata, and pagination.",
      operationId: "searchPropertiesPage",
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Text search keyword in title, description, or location",
        },
        {
          name: "transactionType",
          in: "query",
          schema: { type: "string" },
          description: "Transaction type: 0 for Rent, 1 for Sale",
        },
        {
          name: "city",
          in: "query",
          schema: { type: "string" },
          description: "City name or comma-separated list of cities (e.g. Cairo,Giza)",
        },
        {
          name: "area",
          in: "query",
          schema: { type: "string" },
          description: "Area name or comma-separated list of areas (e.g. New Cairo,Maadi)",
        },
        {
          name: "propertyType",
          in: "query",
          schema: { type: "string" },
          description: "Property type number or comma-separated list (0: Apartment, 1: Villa, etc.)",
        },
        {
          name: "bedrooms",
          in: "query",
          schema: { type: "string" },
          description: "Minimum number of bedrooms",
        },
        {
          name: "bathrooms",
          in: "query",
          schema: { type: "string" },
          description: "Minimum number of bathrooms",
        },
        {
          name: "minPrice",
          in: "query",
          schema: { type: "string" },
          description: "Minimum price",
        },
        {
          name: "maxPrice",
          in: "query",
          schema: { type: "string" },
          description: "Maximum price",
        },
        {
          name: "minArea",
          in: "query",
          schema: { type: "string" },
          description: "Minimum area in square meters",
        },
        {
          name: "maxArea",
          in: "query",
          schema: { type: "string" },
          description: "Maximum area in square meters",
        },
        {
          name: "furnishing",
          in: "query",
          schema: { type: "string" },
          description: "0: Unfurnished, 1: Semi-Furnished, 2: Furnished",
        },
        {
          name: "amenities",
          in: "query",
          schema: { type: "string" },
          description: "Amenity name or comma-separated list of amenities",
        },
        {
          name: "sort",
          in: "query",
          schema: {
            type: "string",
            enum: ["newest", "oldest", "price_asc", "price_desc"],
          },
          description: "Sort order (default: newest)",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "string", default: "1" },
          description: "Page number (1-based)",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "string", default: "10" },
          description: "Number of listings per page",
        },
      ],
      responses: {
        "200": {
          description: "Search results and dynamic filters returned",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/SearchPageResponse" },
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

export const searchPageSwaggerSchemas: Record<string, any> = {
  SearchPageResponse: {
    type: "object",
    properties: {
      filters: {
        type: "object",
        properties: {
          lookingFor: {
            type: "array",
            items: { $ref: "#/components/schemas/LandingEnumOption" },
          },
          areas: {
            type: "array",
            items: { type: "string" },
            example: ["New Cairo", "Sheikh Zayed", "Maadi", "Nasr City"],
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
          bathrooms: {
            type: "array",
            items: { type: "integer" },
            example: [1, 2, 3, 4],
          },
          priceRange: {
            type: "object",
            properties: {
              min: { type: "number", example: 500000 },
              max: { type: "number", example: 35000000 },
            },
          },
          unitAreaRange: {
            type: "object",
            properties: {
              min: { type: "number", example: 60 },
              max: { type: "number", example: 800 },
            },
          },
          finishing: {
            type: "array",
            items: { $ref: "#/components/schemas/LandingEnumOption" },
          },
          amenities: {
            type: "array",
            items: { type: "string" },
            example: ["Garden", "Security", "Private Pool", "Elevator"],
          },
        },
      },
      properties: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPropertyCard" },
      },
      pagination: {
        type: "object",
        properties: {
          total: { type: "integer", example: 45 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          pages: { type: "integer", example: 5 },
        },
      },
    },
  },
};
