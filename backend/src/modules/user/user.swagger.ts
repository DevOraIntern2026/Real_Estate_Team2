export const userSwaggerTags = [
  {
    name: "User",
    description:
      "Authenticated user profile management, avatar upload and deletion, and account deletion",
  },
];

export const userSwaggerPaths: Record<string, any> = {
  "/user": {
    get: {
      tags: ["User"],
      summary: "Get current user profile",
      description:
        "Fetches the authenticated user's profile details including name, email, decrypted phone number, avatar, location, bio, role, and agent license/agency when applicable.",
      operationId: "getCurrentUserProfile",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Profile fetched successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/UserProfile" },
                    },
                  },
                ],
              },
            },
          },
        },
        "401": { description: "Unauthenticated" },
        "404": { description: "User not found" },
      },
    },
    patch: {
      tags: ["User"],
      summary: "Update current user profile",
      description:
        "Updates editable fields on the authenticated user profile (name, email, phone, location, bio, licenseNumber, agencyName).",
      operationId: "updateCurrentUserProfile",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EditProfileRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/UserProfile" },
                    },
                  },
                ],
              },
            },
          },
        },
        "400": { description: "Validation error" },
        "401": { description: "Unauthenticated" },
        "409": { description: "Email already taken" },
      },
    },
    delete: {
      tags: ["User"],
      summary: "Delete current user account",
      description:
        "Soft-deletes the authenticated user account and revokes all active session tokens immediately.",
      operationId: "deleteCurrentUserAccount",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Account deleted successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: { success: { type: "boolean", example: true } },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        "401": { description: "Unauthenticated" },
      },
    },
  },
  "/user/avatar": {
    post: {
      tags: ["User"],
      summary: "Upload user avatar",
      description:
        "Uploads an avatar image (multipart form-data under field 'avatar') to Cloudinary and updates user profileImage.",
      operationId: "uploadUserAvatar",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["avatar"],
              properties: {
                avatar: {
                  type: "string",
                  format: "binary",
                  description: "Avatar image file (JPG, PNG, WebP)",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Avatar uploaded successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          avatar: {
                            type: "string",
                            format: "uri",
                            example:
                              "https://res.cloudinary.com/demo/image/upload/v1/users/avatar.jpg",
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        "400": { description: "No image file provided" },
        "401": { description: "Unauthenticated" },
      },
    },
    delete: {
      tags: ["User"],
      summary: "Remove user avatar",
      description: "Removes user avatar and resets profileImage to null.",
      operationId: "removeUserAvatar",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Avatar removed successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          avatar: { type: "string", nullable: true, example: null },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        "401": { description: "Unauthenticated" },
      },
    },
  },
  "/user/photo": {
    post: {
      tags: ["User"],
      summary: "Upload user photo (alias for avatar)",
      description:
        "Uploads a profile photo (multipart form-data under field 'file') to Cloudinary and updates user profileImage.",
      operationId: "uploadUserPhoto",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file"],
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "Profile photo file (JPG, PNG, WebP)",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Avatar uploaded successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          avatar: {
                            type: "string",
                            format: "uri",
                            example:
                              "https://res.cloudinary.com/demo/image/upload/v1/users/photo.jpg",
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        "400": { description: "No image file provided" },
        "401": { description: "Unauthenticated" },
      },
    },
    delete: {
      tags: ["User"],
      summary: "Remove user photo (alias for avatar delete)",
      description: "Removes user photo and resets profileImage to null.",
      operationId: "removeUserPhoto",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Avatar removed successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          avatar: { type: "string", nullable: true, example: null },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        "401": { description: "Unauthenticated" },
      },
    },
  },
};
