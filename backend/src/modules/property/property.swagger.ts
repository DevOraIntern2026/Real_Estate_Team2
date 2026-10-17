export const propertySwaggerPaths: Record<string, any> = {
  "/properties/{id}/images/{imageId}": {
    patch: {
      tags: ["Properties"],
      summary: "Set property cover image by image ID",
      description:
        "Sets the cover image of the property to the specified image ID from the path, or from the optional imageUrl in the request body. Owner, assigned agent, or admin only.",
      operationId: "setPropertyCoverImageById",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Property MongoDB ObjectId",
          example: "660c1b2f3a4b5c6d7e8f9a0b",
        },
        {
          name: "imageId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "URL-encoded image ID or full Cloudinary URL",
          example: "cover_img_123",
        },
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                imageUrl: {
                  type: "string",
                  format: "uri",
                  description: "Optional image URL override",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Property cover image updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { description: "Unauthenticated" },
        "403": { description: "Forbidden — not property owner, agent, or admin" },
        "404": { description: "Property not found" },
      },
    },
    delete: {
      tags: ["Properties"],
      summary: "Delete single property image",
      description:
        "Removes a single image from the property's images array using its URL-encoded image identifier or URL.",
      operationId: "removeSinglePropertyImage",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Property MongoDB ObjectId",
          example: "660c1b2f3a4b5c6d7e8f9a0b",
        },
        {
          name: "imageId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "URL-encoded image ID or full Cloudinary URL",
          example: "img_to_delete_123",
        },
      ],
      responses: {
        "200": {
          description: "Image removed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { description: "Unauthenticated" },
        "403": { description: "Forbidden" },
        "404": { description: "Property not found" },
      },
    },
  },
  "/properties/{id}/cover-image": {
    patch: {
      tags: ["Properties"],
      summary: "Set property cover image",
      description:
        "Updates the property's cover image with the provided imageUrl in request body. Owner or assigned agent only.",
      operationId: "setPropertyCoverImage",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Property MongoDB ObjectId",
          example: "660c1b2f3a4b5c6d7e8f9a0b",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["imageUrl"],
              properties: {
                imageUrl: {
                  type: "string",
                  format: "uri",
                  description: "Full Cloudinary URL of the cover image",
                  example:
                    "https://res.cloudinary.com/demo/image/upload/v1/properties/cover.jpg",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Property cover image updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { description: "Unauthenticated" },
        "403": { description: "Forbidden" },
        "404": { description: "Property not found" },
      },
    },
  },
};
