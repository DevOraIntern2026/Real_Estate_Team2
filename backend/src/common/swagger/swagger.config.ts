import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import {
  adminSwaggerTags,
  adminSwaggerPaths,
  adminSwaggerSchemas,
  adminSwaggerResponses,
} from "./admin.swagger";
import {
  ownerAgentSwaggerTags,
  ownerAgentSwaggerPaths,
} from "./owner-agent.swagger";

///////////////////////////////////////////////////////////////////////////////
// Reusable schema components
///////////////////////////////////////////////////////////////////////////////
const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
});

const swaggerDefinition: swaggerJsdoc.OAS3Definition = {
  openapi: "3.0.3",
  info: {
    title: "DEVORA Real Estate API",
    version: "1.0.0",
    description:
      "REST API for the DEVORA Real Estate platform — Property Buying, Selling & Renting.\n\n" +
      "**Roles:** Admin (0) · Owner (1) · Customer (2) · Agent (3)\n\n" +
      "**Base URL:** `/api`",
    contact: { name: "Team 2", email: "team2@devora.dev" },
  },
  servers: [
    { url: "/api", description: "Current server (recommended)" },
    { url: "http://localhost:3000/api", description: "Localhost" },
  ],

  /////////////////////////////////////////////////////////////////////////////
  // Tags
  /////////////////////////////////////////////////////////////////////////////
  tags: [
    { name: "Auth", description: "Registration, login, email verification, password reset" },
    { name: "Categories", description: "Property category management (Admin-only for CUD)" },
    { name: "Properties", description: "Property CRUD, search, filtering, images & listing lifecycle" },
    { name: "AI Assistant", description: "Natural language AI property recommendations" },
    ...adminSwaggerTags,
    ...ownerAgentSwaggerTags,
  ],

  /////////////////////////////////////////////////////////////////////////////
  // Paths
  /////////////////////////////////////////////////////////////////////////////
  paths: {
    // ────────────────────────── AUTH ──────────────────────────
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        description:
          "Creates a user with the chosen role (customer, owner, or agent). " +
          "An OTP is sent to the email for verification. Admin accounts cannot be created here.",
        operationId: "signup",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created — OTP sent to email",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/UserProfile" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Validation error"),
          "409": errorResponse("Email already exists"),
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        description: "Returns access and refresh JWT tokens. The account must be verified first.",
        operationId: "login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
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
                            accessToken: { type: "string", example: "eyJhbGci..." },
                            refreshToken: { type: "string", example: "eyJhbGci..." },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": errorResponse("Invalid credentials"),
          "404": errorResponse("Account not verified or not found"),
        },
      },
    },

    "/auth/confirmEmail": {
      patch: {
        tags: ["Auth"],
        summary: "Verify email with OTP",
        description: "Confirms the account using the 6-digit OTP sent to the email.",
        operationId: "confirmEmail",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  otp: { type: "string", pattern: "^\\d{6}$", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "400": errorResponse("Invalid OTP"),
          "404": errorResponse("Account already verified, not found, or OTP expired"),
        },
      },
    },

    "/auth/resendConfirmationEmail": {
      patch: {
        tags: ["Auth"],
        summary: "Resend confirmation OTP",
        description: "Resends a new OTP to the email if the previous one has expired.",
        operationId: "resendConfirmationEmail",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "OTP resent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "404": errorResponse("Account already verified or not found"),
          "409": errorResponse("Previous OTP still valid — wait before resending"),
        },
      },
    },

    "/auth/forgotPassword": {
      post: {
        tags: ["Auth"],
        summary: "Request password-reset OTP",
        description:
          "Sends a 6-digit OTP to the verified email to begin the password-reset flow.",
        operationId: "forgotPassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OTP sent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "404": errorResponse("Account not found"),
          "409": errorResponse("Previous OTP still valid"),
        },
      },
    },

    "/auth/verify/forgotPassword": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with OTP",
        description: "Verifies the OTP and changes the password. Invalidates all existing sessions.",
        operationId: "verifyForgotPassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp", "newPassword"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  otp: { type: "string", pattern: "^\\d{6}$", example: "123456" },
                  newPassword: {
                    type: "string",
                    description:
                      "8–16 chars, must include uppercase, lowercase, digit and special character",
                    example: "NewP@ss1",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "400": errorResponse("Invalid OTP"),
          "404": errorResponse("Account not found or no OTP issued"),
        },
      },
    },

    // ────────────────────── CATEGORIES ──────────────────────
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        description: "Public. Returns a paginated list of categories with optional text search.",
        operationId: "listCategories",
        parameters: [
          { name: "page", in: "query", schema: { type: "string" }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "string" }, description: "Items per page" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Full-text search" },
          { name: "isActive", in: "query", schema: { type: "boolean" }, description: "Filter by active status" },
        ],
        responses: {
          "200": {
            description: "Categories list",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/PaginatedCategories" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category (Admin only)",
        operationId: "createCategory",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCategoryRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Category created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Category" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Validation error"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Admin access required"),
          "409": errorResponse("Category name already exists"),
        },
      },
    },

    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get a category by ID",
        operationId: "getCategoryById",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "MongoDB ObjectId" },
        ],
        responses: {
          "200": {
            description: "Category details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Category" } },
                    },
                  ],
                },
              },
            },
          },
          "404": errorResponse("Category not found"),
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update a category (Admin only)",
        operationId: "updateCategory",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCategoryRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Category updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Category" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Validation error or empty body"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Admin access required"),
          "404": errorResponse("Category not found"),
          "409": errorResponse("Duplicate name"),
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category (Admin only)",
        description: "Soft-deletes the category. Fails if properties are still assigned to it.",
        operationId: "deleteCategory",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Category deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "400": errorResponse("Category still has properties assigned"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Admin access required"),
          "404": errorResponse("Category not found"),
        },
      },
    },

    // ────────────────────── PROPERTIES ──────────────────────
    "/properties": {
      get: {
        tags: ["Properties"],
        summary: "Search & filter published properties",
        description:
          "Public. Returns paginated published properties with full-text search and filtering.",
        operationId: "listProperties",
        parameters: [
          { name: "page", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Full-text search (title, description, location)" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Category ObjectId" },
          {
            name: "propertyType", in: "query",
            schema: { type: "string", enum: ["apartment", "villa", "studio", "duplex", "penthouse", "townhouse", "office", "shop", "warehouse", "land", "building"] },
          },
          {
            name: "transactionType", in: "query",
            schema: { type: "string", enum: ["sale", "rent"] },
          },
          {
            name: "furnishing", in: "query",
            schema: { type: "string", enum: ["unfurnished", "semi_furnished", "furnished"] },
          },
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "area", in: "query", schema: { type: "string" }, description: "Area/district name" },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "minArea", in: "query", schema: { type: "number" }, description: "Min area in m²" },
          { name: "maxArea", in: "query", schema: { type: "number" }, description: "Max area in m²" },
          { name: "bedrooms", in: "query", schema: { type: "integer" } },
          { name: "bathrooms", in: "query", schema: { type: "integer" } },
          { name: "isFeatured", in: "query", schema: { type: "boolean" } },
          {
            name: "sort", in: "query",
            schema: { type: "string", enum: ["newest", "oldest", "price_asc", "price_desc", "most_viewed"] },
          },
        ],
        responses: {
          "200": {
            description: "Paginated properties",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/PaginatedProperties" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Properties"],
        summary: "Create a property (Owner / Agent)",
        description: "Creates a new property as a **Draft**. Requires authentication with Owner or Agent role.",
        operationId: "createProperty",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePropertyRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Property created as draft",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Property" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Validation error or invalid category"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Owner/Agent role required"),
        },
      },
    },

    "/properties/meta/filters": {
      get: {
        tags: ["Properties"],
        summary: "Get filter metadata for search UI",
        description:
          "Returns available categories, property types, transaction types, furnishing options, price range and cities.",
        operationId: "getFilterMeta",
        responses: {
          "200": {
            description: "Filter metadata",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/FilterMeta" },
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

    "/properties/my": {
      get: {
        tags: ["Properties"],
        summary: "Get my own properties (Owner / Agent / Admin)",
        description: "Returns the authenticated user's own properties with optional status filter.",
        operationId: "myProperties",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "string" } },
          {
            name: "status", in: "query",
            schema: {
              type: "string",
              enum: ["draft", "submitted", "under_review", "approved", "published", "rejected", "inactive", "sold", "rented"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Own properties list",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/PaginatedProperties" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Owner/Agent/Admin role required"),
        },
      },
    },

    "/properties/{id}": {
      get: {
        tags: ["Properties"],
        summary: "Get property details",
        description:
          "Public for published properties. Owners/Admins can view non-public listings. " +
          "Increments the view counter for public anonymous traffic.",
        operationId: "getPropertyById",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Property details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Property" } },
                    },
                  ],
                },
              },
            },
          },
          "404": errorResponse("Property not found"),
        },
      },
      patch: {
        tags: ["Properties"],
        summary: "Update a property (Owner / Agent / Admin)",
        description:
          "Owner/Agent can update their own listings. If the listing was already approved/published, " +
          "updating it moves it back to Submitted for re-review. Admin can update any listing.",
        operationId: "updateProperty",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePropertyRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Property updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Property" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Validation error or empty body"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Not the owner or admin"),
          "404": errorResponse("Property not found"),
        },
      },
      delete: {
        tags: ["Properties"],
        summary: "Delete a property (soft delete)",
        description: "Owner/Agent can delete their own listings. Admin can delete any.",
        operationId: "deleteProperty",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Property deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Not the owner or admin"),
          "404": errorResponse("Property not found"),
        },
      },
    },

    "/properties/{id}/submit": {
      patch: {
        tags: ["Properties"],
        summary: "Submit property for admin review (Owner / Agent)",
        description:
          "Moves a Draft or Rejected property to Submitted status. Only the property owner can submit.",
        operationId: "submitProperty",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Property submitted for review",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Property" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Only draft or rejected listings can be submitted"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Not the owner"),
          "404": errorResponse("Property not found"),
        },
      },
    },

    "/properties/{id}/status": {
      patch: {
        tags: ["Properties"],
        summary: "Update property status (Admin only — approval workflow)",
        description:
          "Admin can approve, publish, reject, mark as inactive/sold/rented.\n\n" +
          "**Allowed transitions:**\n" +
          "- `approved` ← submitted, under_review\n" +
          "- `published` ← submitted, under_review, approved\n" +
          "- `rejected` ← submitted, under_review (requires `rejectionReason`)\n" +
          "- `inactive` ← published\n" +
          "- `sold` ← published\n" +
          "- `rented` ← published",
        operationId: "updatePropertyStatus",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePropertyStatusRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Status updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Property" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Invalid status transition or missing rejection reason"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Admin access required"),
          "404": errorResponse("Property not found"),
        },
      },
    },

    "/properties/{id}/images": {
      post: {
        tags: ["Properties"],
        summary: "Upload images to a property",
        description:
          "Upload up to 10 images at a time (max 15 total per property). " +
          "Images are stored on Cloudinary. Only the owner or an admin can upload.",
        operationId: "addPropertyImages",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                    maxItems: 10,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Images uploaded",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Property" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("No images provided or max limit exceeded (15)"),
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Not the owner or admin"),
          "404": errorResponse("Property not found"),
        },
      },
      delete: {
        tags: ["Properties"],
        summary: "Remove an image from a property",
        description: "Deletes the image from Cloudinary and removes it from the property.",
        operationId: "removePropertyImage",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["imageUrl"],
                properties: {
                  imageUrl: { type: "string", format: "uri", example: "https://res.cloudinary.com/..." },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Image removed",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/Property" } },
                    },
                  ],
                },
              },
            },
          },
          "401": errorResponse("Not authenticated"),
          "403": errorResponse("Not the owner or admin"),
          "404": errorResponse("Property or image not found"),
        },
      },
    },

    // ────────────────────── AI ASSISTANT ──────────────────────
    "/ai/recommend": {
      post: {
        tags: ["AI Assistant"],
        summary: "Get AI property recommendations",
        description:
          "Public. Interprets natural language requirements, extracts structured preferences, and matches real verified listings.",
        operationId: "getAiRecommendations",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AIRecommendRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Recommendations, clarification response, or unsupported action notification",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: { data: { $ref: "#/components/schemas/AIRecommendResponse" } },
                    },
                  ],
                },
              },
            },
          },
          "400": errorResponse("Validation error (e.g. empty message or exceeding 2000 characters)"),
          "429": errorResponse("Rate limit exceeded — too many requests to AI Assistant"),
          "503": errorResponse("AI service temporarily unavailable"),
        },
      },
    },
    ...adminSwaggerPaths,
    ...ownerAgentSwaggerPaths,
  },

  /////////////////////////////////////////////////////////////////////////////
  // Components
  /////////////////////////////////////////////////////////////////////////////
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Pass the access token returned from `/auth/login`",
      },
    },
    responses: {
      ...adminSwaggerResponses,
    },

    schemas: {
      // ─── Generic envelopes ───
      SuccessResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Success" },
          data: { type: "object", nullable: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          Error: { type: "string", example: "Error message" },
        },
      },

      // ─── Auth DTOs ───
      SignupRequest: {
        type: "object",
        required: ["username", "email", "password", "confirmPassword"],
        properties: {
          username: { type: "string", minLength: 2, maxLength: 25, example: "Ahmed Salem" },
          email: { type: "string", format: "email", example: "ahmed@example.com" },
          password: {
            type: "string",
            description: "8–16 chars, must include uppercase, lowercase, digit and special character",
            example: "P@ssw0rd",
          },
          confirmPassword: { type: "string", example: "P@ssw0rd" },
          phone: { type: "string", description: "Egyptian phone number", example: "01012345678" },
          role: {
            type: "string",
            enum: ["customer", "owner", "agent"],
            default: "customer",
          },
          gender: {
            type: "string",
            enum: ["male", "female"],
            default: "male",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "ahmed@example.com" },
          password: { type: "string", example: "P@ssw0rd" },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          _id: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "integer", description: "0=Admin, 1=Owner, 2=Customer, 3=Agent" },
          gender: { type: "integer", description: "0=Male, 1=Female" },
          phone: { type: "string", nullable: true },
          profileImage: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // ─── Category ───
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "Residential" },
          slug: { type: "string", example: "residential" },
          description: { type: "string", nullable: true },
          icon: { type: "string", nullable: true },
          image: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateCategoryRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 50, example: "Residential" },
          description: { type: "string", maxLength: 300 },
          icon: { type: "string" },
          image: { type: "string" },
        },
      },
      UpdateCategoryRequest: {
        type: "object",
        description: "At least one field required",
        properties: {
          name: { type: "string", minLength: 2, maxLength: 50 },
          description: { type: "string", maxLength: 300 },
          icon: { type: "string" },
          image: { type: "string" },
          isActive: { type: "boolean" },
        },
      },
      PaginatedCategories: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Category" } },
          totalDocs: { type: "integer" },
          totalPages: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
        },
      },

      // ─── Location (sub-document) ───
      Location: {
        type: "object",
        required: ["address", "city", "area"],
        properties: {
          address: { type: "string", minLength: 3, maxLength: 200, example: "15 Tahrir St." },
          city: { type: "string", minLength: 2, maxLength: 60, example: "Cairo" },
          area: { type: "string", minLength: 2, maxLength: 60, example: "New Cairo" },
          state: { type: "string", maxLength: 60 },
          country: { type: "string", default: "Egypt" },
          coordinates: {
            type: "object",
            properties: {
              lat: { type: "number", minimum: -90, maximum: 90, example: 30.0444 },
              lng: { type: "number", minimum: -180, maximum: 180, example: 31.2357 },
            },
          },
        },
      },

      // ─── Property ───
      Property: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          category: {
            oneOf: [
              { type: "string", description: "ObjectId when not populated" },
              { $ref: "#/components/schemas/Category" },
            ],
          },
          propertyType: { type: "integer", description: "0=Apartment … 10=Building" },
          transactionType: { type: "integer", description: "0=Sale, 1=Rent" },
          price: { type: "number" },
          currency: { type: "string", default: "EGP" },
          area: { type: "number", description: "Area in m²" },
          bedrooms: { type: "integer", nullable: true },
          bathrooms: { type: "integer", nullable: true },
          floor: { type: "integer", nullable: true },
          furnishing: { type: "integer", description: "0=Unfurnished, 1=Semi, 2=Furnished", nullable: true },
          amenities: { type: "array", items: { type: "string" } },
          location: { $ref: "#/components/schemas/Location" },
          images: { type: "array", items: { type: "string", format: "uri" } },
          coverImage: { type: "string", format: "uri", nullable: true },
          owner: {
            oneOf: [
              { type: "string" },
              { $ref: "#/components/schemas/UserProfile" },
            ],
          },
          status: {
            type: "integer",
            description: "0=Draft, 1=Submitted, 2=UnderReview, 3=Approved, 4=Published, 5=Rejected, 6=Inactive, 7=Sold, 8=Rented",
          },
          rejectionReason: { type: "string", nullable: true },
          views: { type: "integer" },
          isFeatured: { type: "boolean" },
          publishedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreatePropertyRequest: {
        type: "object",
        required: [
          "title", "description", "category", "propertyType",
          "transactionType", "price", "area", "location",
        ],
        properties: {
          title: { type: "string", minLength: 5, maxLength: 120, example: "Luxury 3BR Apartment in New Cairo" },
          description: { type: "string", minLength: 20, maxLength: 3000, example: "Spacious apartment with a balcony and city view..." },
          category: { type: "string", description: "Category ObjectId", example: "665f1a2b3c4d5e6f7a8b9c0d" },
          propertyType: {
            type: "string",
            enum: ["apartment", "villa", "studio", "duplex", "penthouse", "townhouse", "office", "shop", "warehouse", "land", "building"],
          },
          transactionType: { type: "string", enum: ["sale", "rent"] },
          price: { type: "number", minimum: 1, example: 2500000 },
          currency: { type: "string", maxLength: 5, default: "EGP" },
          area: { type: "number", minimum: 1, description: "Area in m²", example: 180 },
          bedrooms: { type: "integer", minimum: 0, example: 3 },
          bathrooms: { type: "integer", minimum: 0, example: 2 },
          floor: { type: "integer", example: 5 },
          furnishing: { type: "string", enum: ["unfurnished", "semi_furnished", "furnished"] },
          amenities: {
            type: "array",
            items: { type: "string", maxLength: 40 },
            maxItems: 30,
            example: ["parking", "pool", "gym"],
          },
          location: { $ref: "#/components/schemas/Location" },
        },
      },
      UpdatePropertyRequest: {
        type: "object",
        description: "All fields from CreatePropertyRequest, all optional. At least one field required.",
        properties: {
          title: { type: "string", minLength: 5, maxLength: 120 },
          description: { type: "string", minLength: 20, maxLength: 3000 },
          category: { type: "string" },
          propertyType: {
            type: "string",
            enum: ["apartment", "villa", "studio", "duplex", "penthouse", "townhouse", "office", "shop", "warehouse", "land", "building"],
          },
          transactionType: { type: "string", enum: ["sale", "rent"] },
          price: { type: "number", minimum: 1 },
          currency: { type: "string" },
          area: { type: "number", minimum: 1 },
          bedrooms: { type: "integer", minimum: 0 },
          bathrooms: { type: "integer", minimum: 0 },
          floor: { type: "integer" },
          furnishing: { type: "string", enum: ["unfurnished", "semi_furnished", "furnished"] },
          amenities: { type: "array", items: { type: "string" } },
          location: { $ref: "#/components/schemas/Location" },
        },
      },
      UpdatePropertyStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["approved", "published", "rejected", "inactive", "sold", "rented"],
            example: "approved",
          },
          rejectionReason: {
            type: "string",
            maxLength: 300,
            description: "Required when status is 'rejected'",
          },
        },
      },
      PaginatedProperties: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Property" } },
          totalDocs: { type: "integer" },
          totalPages: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
        },
      },
      FilterMeta: {
        type: "object",
        properties: {
          categories: { type: "array", items: { $ref: "#/components/schemas/Category" } },
          propertyTypes: {
            type: "array",
            items: { type: "string" },
            example: ["apartment", "villa", "studio"],
          },
          transactionTypes: {
            type: "array",
            items: { type: "string" },
            example: ["sale", "rent"],
          },
          furnishingOptions: {
            type: "array",
            items: { type: "string" },
            example: ["unfurnished", "semi_furnished", "furnished"],
          },
          priceRange: {
            type: "object",
            properties: {
              minPrice: { type: "number" },
              maxPrice: { type: "number" },
            },
          },
          cities: { type: "array", items: { type: "string" }, example: ["Cairo", "Alexandria"] },
        },
      },

      // ─── AI Assistant DTOs ───
      AIRecommendRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            minLength: 1,
            maxLength: 2000,
            example: "I need a 2-bedroom apartment for rent in New Cairo under 20000.",
          },
        },
      },
      AISoftPreferences: {
        type: "object",
        properties: {
          quietArea: { type: "boolean", nullable: true },
          nearUniversity: { type: "boolean", nullable: true },
          parking: { type: "boolean", nullable: true },
          balcony: { type: "boolean", nullable: true },
        },
      },
      AIExtractedPreferences: {
        type: "object",
        properties: {
          transactionType: {
            type: "string",
            enum: ["sale", "rent"],
            nullable: true,
          },
          propertyType: {
            type: "string",
            nullable: true,
            example: "apartment",
          },
          location: {
            type: "string",
            nullable: true,
            example: "New Cairo",
          },
          minPrice: { type: "number", nullable: true },
          maxPrice: { type: "number", nullable: true, example: 20000 },
          bedrooms: { type: "integer", nullable: true, example: 2 },
          bathrooms: { type: "integer", nullable: true },
          minArea: { type: "number", nullable: true },
          maxArea: { type: "number", nullable: true },
          furnished: { type: "boolean", nullable: true },
          preferences: { $ref: "#/components/schemas/AISoftPreferences" },
        },
      },
      AIRecommendResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          preferences: { $ref: "#/components/schemas/AIExtractedPreferences" },
          needsClarification: { type: "boolean", example: false },
          clarificationQuestion: { type: "string", nullable: true },
          unsupportedAction: { type: "boolean", example: false },
          actionMessage: { type: "string", nullable: true },
          recommendations: {
            type: "array",
            items: { $ref: "#/components/schemas/Property" },
          },
          meta: {
            type: "object",
            properties: {
              count: { type: "integer", example: 1 },
            },
          },
        },
      },
      ...adminSwaggerSchemas,
    },
  },
};

const swaggerSpec = swaggerJsdoc({ definition: swaggerDefinition, apis: [] });

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "DEVORA API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
      },
    }),
  );

  // Raw JSON spec for Postman import / code generators
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
