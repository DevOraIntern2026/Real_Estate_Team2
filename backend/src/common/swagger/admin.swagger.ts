export const adminSwaggerTags = [
  {
    name: "Admin - Overview",
    description: "Overview dashboard stats, pending review listings, and recent notifications",
  },
  {
    name: "Admin - Listings",
    description: "Property listings management, approval workflow, and review decisions",
  },
  {
    name: "Admin - Users",
    description: "User management, profile inspection, activation, and suspension",
  },
  {
    name: "Admin - Notifications",
    description: "Admin notification inbox and unread badge counters",
  },
  {
    name: "Admin - Reports",
    description: "Platform analytics, transaction distribution, and user demographics",
  },
  {
    name: "Admin - Profile",
    description: "Admin account settings, photo upload, and password management",
  },
];

export const adminSwaggerResponses = {
  Unauthorized: {
    description: "Unauthorized - missing or invalid JWT bearer token",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  Forbidden: {
    description: "Forbidden - user does not have required Admin role",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  NotFound: {
    description: "Requested resource not found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
};

export const adminSwaggerSchemas = {
  // ─── Overview ───
  AdminOverviewResponse: {
    type: "object",
    properties: {
      stats: {
        type: "object",
        properties: {
          totalUsers: { type: "integer", example: 120 },
          totalListings: { type: "integer", example: 45 },
          newUsers30d: { type: "integer", example: 18 },
          published: { type: "integer", example: 30 },
        },
      },
      pendingListings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            code: { type: "string", example: "DEV-1042" },
            title: { type: "string", example: "Modern Luxury Villa" },
            thumbnail: { type: "string" },
            owner: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string", example: "Sara Ahmed" },
                role: { type: "string", example: "agent" },
              },
            },
            propertyType: { type: "string", example: "villa" },
            transaction: { type: "string", example: "rent" },
            area: { type: "string", example: "Riverside" },
            price: { type: "number", example: 75000 },
            currency: { type: "string", example: "EGP" },
            status: { type: "string", example: "under_review" },
            submittedAt: { type: "string", format: "date-time" },
          },
        },
      },
      recentNotifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", example: "listing_submitted" },
            title: { type: "string", example: "New listing submitted" },
            body: { type: "string" },
            isRead: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
      unreadNotifications: { type: "integer", example: 3 },
    },
  },

  // ─── Listing Decisions ───
  ApproveListingRequest: {
    type: "object",
    required: ["propertyType", "category"],
    properties: {
      propertyType: {
        type: "string",
        example: "villa",
        description: "Valid PropertyType enum string (apartment, villa, duplex, etc.)",
      },
      category: {
        type: "string",
        example: "commercial",
        description: "Category ID, slug, or name",
      },
    },
  },
  RejectListingRequest: {
    type: "object",
    required: ["reason"],
    properties: {
      reason: { type: "string", example: "incorrect_price" },
      feedback: { type: "string", maxLength: 1000, example: "Please confirm the listed price is correct" },
    },
  },
  RequestChangesRequest: {
    type: "object",
    required: ["feedback"],
    properties: {
      feedback: {
        type: "string",
        maxLength: 1000,
        example: "Please upload clearer photos of the living room.",
      },
    },
  },
  SuspendUserRequest: {
    type: "object",
    properties: {
      reason: { type: "string", maxLength: 500, example: "Violation of terms of service" },
    },
  },
  EditProfileRequest: {
    type: "object",
    properties: {
      name: { type: "string", example: "Omar Omran" },
      email: { type: "string", format: "email", example: "omar@gmail.com" },
      phone: { type: "string", example: "01012345678" },
      location: { type: "string", example: "New Cairo, Egypt" },
    },
  },
  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword", "confirmPassword"],
    properties: {
      currentPassword: { type: "string", example: "OldPass@123" },
      newPassword: { type: "string", example: "NewPass@123" },
      confirmPassword: { type: "string", example: "NewPass@123" },
    },
  },
  RefreshTokenRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", description: "JWT refresh token" },
    },
  },
};

export const adminSwaggerPaths = {
  // ────────────────────────── OVERVIEW ──────────────────────────
  "/v1/admin/overview": {
    get: {
      tags: ["Admin - Overview"],
      summary: "Get Admin Dashboard Overview",
      description: "Aggregates total stats, pending listings for review, recent notifications, and unread count in a single round-trip.",
      operationId: "adminGetOverview",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "pendingLimit", in: "query", schema: { type: "string", default: "5" } },
        { name: "notificationsLimit", in: "query", schema: { type: "string", default: "3" } },
      ],
      responses: {
        "200": {
          description: "Overview dashboard data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminOverviewResponse" },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
      },
    },
  },

  // ────────────────────────── LISTINGS ──────────────────────────
  "/v1/admin/listings": {
    get: {
      tags: ["Admin - Listings"],
      summary: "List all properties with filters & pagination",
      description: "Table of all platform listings with status tab filters, search query, type, location, and sorting.",
      operationId: "adminGetListings",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          description: "Status filter matching tabs: under_review, change_required, published, rejected, inactive, sold_rented, or all",
          schema: { type: "string", enum: ["all", "under_review", "change_required", "published", "rejected", "inactive", "sold_rented"] },
        },
        { name: "transaction", in: "query", schema: { type: "string", enum: ["sale", "rent"] } },
        { name: "type", in: "query", schema: { type: "string" } },
        { name: "location", in: "query", schema: { type: "string" } },
        { name: "q", in: "query", description: "Search by title, listing code, or city", schema: { type: "string" } },
        { name: "sort", in: "query", schema: { type: "string", default: "-submittedAt" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        "200": {
          description: "Paginated listings table",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { type: "object" } },
                  meta: {
                    type: "object",
                    properties: {
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      total: { type: "integer" },
                      totalPages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
      },
    },
  },

  "/v1/admin/listings/counts": {
    get: {
      tags: ["Admin - Listings"],
      summary: "Get counts badge per listing status tab",
      description: "Returns count of listings for each tab: all, under_review, change_required, published, rejected, inactive, sold_rented.",
      operationId: "adminGetListingsCounts",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Tab counts",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  all: { type: "integer", example: 20 },
                  under_review: { type: "integer", example: 6 },
                  change_required: { type: "integer", example: 2 },
                  published: { type: "integer", example: 3 },
                  rejected: { type: "integer", example: 3 },
                  inactive: { type: "integer", example: 3 },
                  sold_rented: { type: "integer", example: 3 },
                },
              },
            },
          },
        },
      },
    },
  },

  "/v1/admin/listings/filters": {
    get: {
      tags: ["Admin - Listings"],
      summary: "Get distinct filter dropdown values",
      description: "Returns available property types, transactions, and distinct locations from the database.",
      operationId: "adminGetListingsFilters",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Available filter options",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  types: { type: "array", items: { type: "string" } },
                  transactions: { type: "array", items: { type: "string" } },
                  locations: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
  },

  "/v1/admin/listings/categories": {
    get: {
      tags: ["Admin - Listings"],
      summary: "Get active categories for approve modal",
      description: "Returns active category options to populate the Category dropdown when approving a listing.",
      operationId: "adminGetListingsCategories",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "List of active categories",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    slug: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/v1/admin/listings/{id}": {
    get: {
      tags: ["Admin - Listings"],
      summary: "Get Property Details for Admin",
      description: "Returns comprehensive details of a listing, including owner details, facilities, and allowedActions.",
      operationId: "adminGetListingById",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "Full property details" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Admin - Listings"],
      summary: "Edit Listing (Admin)",
      description: "Admin edit of listing details, price, facilities, or description.",
      operationId: "adminUpdateListing",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                propertyType: { type: "string" },
                facilities: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Listing updated" },
      },
    },
  },

  "/v1/admin/listings/{id}/approve": {
    post: {
      tags: ["Admin - Listings"],
      summary: "Approve listing",
      description: "Approves a pending listing, publishes it, records status history, and notifies the owner.",
      operationId: "adminApproveListing",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApproveListingRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Listing approved and published" },
        "409": { description: "Listing is not under review" },
      },
    },
  },

  "/v1/admin/listings/{id}/reject": {
    post: {
      tags: ["Admin - Listings"],
      summary: "Reject listing",
      description: "Rejects a pending listing with reason and feedback, records history, and notifies the owner.",
      operationId: "adminRejectListing",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RejectListingRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Listing rejected" },
        "409": { description: "Listing is not under review" },
      },
    },
  },

  "/v1/admin/listings/{id}/request-changes": {
    post: {
      tags: ["Admin - Listings"],
      summary: "Request changes for listing",
      description: "Moves listing to change_required status and notifies owner with feedback.",
      operationId: "adminRequestChanges",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RequestChangesRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Changes requested" },
      },
    },
  },

  "/v1/admin/listings/{id}/deactivate": {
    post: {
      tags: ["Admin - Listings"],
      summary: "Deactivate listing",
      description: "Moves a published listing to inactive state.",
      operationId: "adminDeactivateListing",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "Listing deactivated" },
      },
    },
  },

  "/v1/admin/listings/{id}/reactivate": {
    post: {
      tags: ["Admin - Listings"],
      summary: "Reactivate listing",
      description: "Re-publishes an inactive listing.",
      operationId: "adminReactivateListing",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "Listing reactivated" },
      },
    },
  },

  // ────────────────────────── USERS ──────────────────────────
  "/v1/admin/users": {
    get: {
      tags: ["Admin - Users"],
      summary: "List all users with filters & pagination",
      description: "Returns paginated list of users with role, status, and aggregated listingsCount.",
      operationId: "adminGetUsers",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "role", in: "query", schema: { type: "string", enum: ["admin", "customer", "owner", "agent"] } },
        { name: "status", in: "query", schema: { type: "string", enum: ["active", "suspended"] } },
        { name: "q", in: "query", description: "Search by name or email", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        "200": { description: "Paginated users table" },
      },
    },
  },

  "/v1/admin/users/{id}": {
    get: {
      tags: ["Admin - Users"],
      summary: "Get User Profile with Listings Summary",
      description: "Returns user information and computed listings summary (total, published, pending, rejected, rent, sale).",
      operationId: "adminGetUserById",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "User profile data" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },

  "/v1/admin/users/{id}/listings": {
    get: {
      tags: ["Admin - Users"],
      summary: "Get listings owned by user",
      description: "Returns paginated listings belonging to the specified user.",
      operationId: "adminGetUserListings",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        "200": { description: "Paginated listings for user" },
      },
    },
  },

  "/v1/admin/users/{id}/activate": {
    post: {
      tags: ["Admin - Users"],
      summary: "Activate user",
      description: "Reactivates a suspended user.",
      operationId: "adminActivateUser",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "User activated" },
        "409": { description: "User is already active" },
      },
    },
  },

  "/v1/admin/users/{id}/suspend": {
    post: {
      tags: ["Admin - Users"],
      summary: "Suspend user",
      description: "Suspends a user, records suspension reason, and revokes all active JWT sessions.",
      operationId: "adminSuspendUser",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SuspendUserRequest" },
          },
        },
      },
      responses: {
        "200": { description: "User suspended" },
        "403": { description: "Cannot suspend self" },
      },
    },
  },

  // ────────────────────────── NOTIFICATIONS ──────────────────────────
  "/v1/admin/notifications": {
    get: {
      tags: ["Admin - Notifications"],
      summary: "Get admin notifications",
      description: "Returns paginated list of admin notifications with unreadCount.",
      operationId: "adminGetNotifications",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        { name: "unreadOnly", in: "query", schema: { type: "boolean" } },
      ],
      responses: {
        "200": { description: "Notifications list" },
      },
    },
    delete: {
      tags: ["Admin - Notifications"],
      summary: "Clear all notifications",
      description: "Soft deletes all notifications for this admin.",
      operationId: "adminClearNotifications",
      security: [{ bearerAuth: [] }],
      responses: {
        "204": { description: "All notifications cleared" },
      },
    },
  },

  "/v1/admin/notifications/unread-count": {
    get: {
      tags: ["Admin - Notifications"],
      summary: "Get unread notifications count",
      description: "Feeds the sidebar notification badge.",
      operationId: "adminGetUnreadCount",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Unread count",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { unreadCount: { type: "integer", example: 3 } },
              },
            },
          },
        },
      },
    },
  },

  "/v1/admin/notifications/{id}/read": {
    patch: {
      tags: ["Admin - Notifications"],
      summary: "Mark notification as read",
      description: "Idempotently marks a single notification as read and returns the remaining unread count.",
      operationId: "adminMarkNotificationRead",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "Marked as read" },
      },
    },
  },

  "/v1/admin/notifications/read-all": {
    patch: {
      tags: ["Admin - Notifications"],
      summary: "Mark all notifications as read",
      description: "Marks all notifications as read in bulk.",
      operationId: "adminMarkAllRead",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "All marked as read" },
      },
    },
  },

  // ────────────────────────── REPORTS ──────────────────────────
  "/v1/admin/reports": {
    get: {
      tags: ["Admin - Reports"],
      summary: "Get Reports & Analytics",
      description: "Returns transaction distributions, listing overview, and user demographics with optional date filters.",
      operationId: "adminGetReports",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "from", in: "query", schema: { type: "string", format: "date" } },
        { name: "to", in: "query", schema: { type: "string", format: "date" } },
      ],
      responses: {
        "200": {
          description: "Report analytics metrics",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  range: {
                    type: "object",
                    properties: {
                      from: { type: "string", nullable: true },
                      to: { type: "string", nullable: true },
                    },
                  },
                  transactions: {
                    type: "object",
                    properties: {
                      sale: { type: "integer" },
                      rent: { type: "integer" },
                      total: { type: "integer" },
                    },
                  },
                  listings: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      published: { type: "integer" },
                      pending: { type: "integer" },
                      rejected: { type: "integer" },
                      inactive: { type: "integer" },
                    },
                  },
                  users: {
                    type: "object",
                    properties: {
                      customers: { type: "integer" },
                      owners: { type: "integer" },
                      agents: { type: "integer" },
                      total: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // ────────────────────────── AUTH & PROFILE ──────────────────────────
  "/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Get current user profile",
      description: "Returns profile details of the authenticated user (name, email, decrypted phone, role, avatar).",
      operationId: "getMe",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "User profile" },
      },
    },
    patch: {
      tags: ["Auth"],
      summary: "Update current user profile",
      description: "Updates profile fields (name, email, phone, location).",
      operationId: "updateMe",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EditProfileRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Updated profile" },
        "409": { description: "Email already taken" },
      },
    },
  },

  "/auth/me/photo": {
    post: {
      tags: ["Auth"],
      summary: "Upload profile photo",
      description: "Uploads an avatar image (multipart/form-data) to Cloudinary and saves URL in user profile.",
      operationId: "updateProfilePhoto",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "New avatar URL",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { avatar: { type: "string", format: "uri" } },
              },
            },
          },
        },
      },
    },
  },

  "/auth/change-password": {
    post: {
      tags: ["Auth"],
      summary: "Change password (Authenticated)",
      description: "Validates current password, checks password strength rules, updates password, and revokes other sessions.",
      operationId: "changePassword",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Password changed successfully" },
        "400": { description: "Invalid current password or new password same as current" },
      },
    },
  },

  "/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Logout (Revoke session)",
      description: "Revokes the active JWT session and refresh token.",
      operationId: "logout",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "204": { description: "Logged out successfully" },
      },
    },
  },

  "/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Refresh access token",
      description: "Rotates refresh token and issues fresh access and refresh token pair.",
      operationId: "refreshToken",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Tokens refreshed" },
      },
    },
  },

  // ────────────────────────── ADMIN PROFILE ALIASES ──────────────────────────
  "/v1/admin/profile": {
    get: {
      tags: ["Admin - Profile"],
      summary: "Get admin profile",
      description: "Returns profile information for the authenticated admin user.",
      operationId: "adminGetProfile",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Admin profile details" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
      },
    },
    patch: {
      tags: ["Admin - Profile"],
      summary: "Update admin profile",
      description: "Updates admin name, email, phone, or location.",
      operationId: "adminUpdateProfile",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EditProfileRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Profile updated successfully" },
        "400": { description: "Validation error" },
        "409": { description: "Email already taken" },
      },
    },
  },

  "/v1/admin/profile/photo": {
    post: {
      tags: ["Admin - Profile"],
      summary: "Upload admin profile photo",
      description: "Uploads admin avatar to Cloudinary and updates profile.",
      operationId: "adminUploadPhoto",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Photo updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { avatar: { type: "string", format: "uri" } },
              },
            },
          },
        },
      },
    },
  },

  "/v1/admin/profile/password": {
    post: {
      tags: ["Admin - Profile"],
      summary: "Change admin password",
      description: "Verifies current password, enforces password strength, and rotates credentials.",
      operationId: "adminChangePassword",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
          },
        },
      },
      responses: {
        "200": { description: "Password changed successfully" },
        "400": { description: "Invalid current password" },
      },
    },
  },
};

