export const ownerAgentSwaggerTags = [
  { name: "Dashboard", description: "Owner & Agent dashboard summaries, metrics and recent items" },
  { name: "Inquiries", description: "Property customer inquiries, messages and conversations" },
  { name: "Notifications", description: "User activity and system notifications with read states" },
  { name: "Reports", description: "Listing analytics, transaction distributions and performance summaries" },
  { name: "Agent", description: "Agent-client associations and managed property scope" },
  { name: "Profile", description: "Current user profile (/me), avatar, password and security settings" },
];

export const ownerAgentSwaggerPaths: Record<string, any> = {
  "/dashboard/summary": {
    get: {
      tags: ["Dashboard"],
      summary: "Get dashboard metrics summary",
      description:
        "Returns calculated counts for totalProperties, published, underReview, newInquiries30d, unreadNotifications, and for agents: clients, closedDeals.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Summary data fetched successfully",
        },
        "401": { description: "Unauthenticated" },
      },
    },
  },
  "/dashboard/recent-properties": {
    get: {
      tags: ["Dashboard"],
      summary: "Get recent properties for dashboard",
      parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 3 } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Recent properties retrieved" },
        "401": { description: "Unauthenticated" },
      },
    },
  },
  "/dashboard/recent-inquiries": {
    get: {
      tags: ["Dashboard"],
      summary: "Get recent inquiries for dashboard",
      parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 3 } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Recent inquiries retrieved" },
        "401": { description: "Unauthenticated" },
      },
    },
  },
  "/dashboard/recent-notifications": {
    get: {
      tags: ["Dashboard"],
      summary: "Get recent notifications for dashboard",
      parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 3 } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Recent notifications retrieved" },
        "401": { description: "Unauthenticated" },
      },
    },
  },
  "/dashboard": {
    get: {
      tags: ["Dashboard"],
      summary: "Get unified dashboard",
      description: "Returns summary, recentProperties, recentInquiries, and recentNotifications in a single request.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Dashboard fetched" },
        "401": { description: "Unauthenticated" },
      },
    },
  },

  // Property Options & Wizard helpers
  "/properties/options": {
    get: {
      tags: ["Properties"],
      summary: "Get property dropdown options & validation limits",
      description: "Returns categories, propertyTypes, transactionTypes, cities, facilities, amenities, and image limits.",
      responses: {
        "200": { description: "Options retrieved" },
      },
    },
  },
  "/properties/{id}/review": {
    get: {
      tags: ["Properties"],
      summary: "Get review details & validation checklist before submission",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Review details fetched" },
        "403": { description: "Forbidden" },
        "404": { description: "Property not found" },
      },
    },
  },
  "/properties/{id}/assign": {
    patch: {
      tags: ["Properties"],
      summary: "Assign property to a client (Agent / Admin)",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["clientId"],
              properties: { clientId: { type: "string" } },
            },
          },
        },
      },
      responses: {
        "200": { description: "Property assigned successfully" },
        "403": { description: "Unauthorized relationship" },
      },
    },
  },

  // Inquiries
  "/inquiries": {
    get: {
      tags: ["Inquiries"],
      summary: "List authorized inquiries",
      description: "Returns inquiries for properties managed by the authenticated user with status and search filters.",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "status", in: "query", schema: { type: "string", enum: ["new", "responded", "closed"] } },
        { name: "propertyId", in: "query", schema: { type: "string" } },
        { name: "q", in: "query", schema: { type: "string" } },
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Inquiries list retrieved" },
        "401": { description: "Unauthenticated" },
      },
    },
    post: {
      tags: ["Inquiries"],
      summary: "Create inquiry (Public customer endpoint)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["propertyId", "customerName", "customerEmail", "customerPhone", "message"],
              properties: {
                propertyId: { type: "string" },
                customerName: { type: "string" },
                customerEmail: { type: "string", format: "email" },
                customerPhone: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Inquiry submitted" },
        "404": { description: "Property not found" },
      },
    },
  },
  "/inquiries/{id}": {
    get: {
      tags: ["Inquiries"],
      summary: "Get inquiry details",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Inquiry details retrieved" },
        "403": { description: "Forbidden (IDOR protection)" },
        "404": { description: "Inquiry not found" },
      },
    },
  },
  "/inquiries/{id}/messages": {
    get: {
      tags: ["Inquiries"],
      summary: "Get conversation messages for inquiry",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Messages list retrieved" },
        "403": { description: "Forbidden" },
      },
    },
    post: {
      tags: ["Inquiries"],
      summary: "Send reply to inquiry (auto-transitions status to responded)",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["text"],
              properties: { text: { type: "string" } },
            },
          },
        },
      },
      responses: {
        "201": { description: "Message created" },
        "403": { description: "Forbidden" },
      },
    },
  },
  "/inquiries/{id}/status": {
    patch: {
      tags: ["Inquiries"],
      summary: "Update inquiry status",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: { status: { type: "string", enum: ["new", "responded", "closed"] } },
            },
          },
        },
      },
      responses: {
        "200": { description: "Inquiry status updated" },
        "403": { description: "Forbidden" },
      },
    },
  },
  "/inquiries/{id}/close": {
    patch: {
      tags: ["Inquiries"],
      summary: "Close or archive inquiry",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Inquiry closed successfully" },
        "403": { description: "Forbidden" },
      },
    },
  },

  // ────────────────────────── CUSTOMER INQUIRIES & CHATS ──────────────────────────
  "/customer/inquiries": {
    get: {
      tags: ["Customer Inquiries"],
      summary: "Fetch customer inquiries list (UI: My Inquiries)",
      description: "Returns paginated list of inquiries created by the authenticated customer with status badges and profile info.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "status", in: "query", schema: { type: "string", enum: ["all", "pending", "replied", "closed"] } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "sort_by", in: "query", schema: { type: "string", enum: ["newest", "oldest", "price_high", "price_low"] } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 4 } },
      ],
      responses: {
        "200": { description: "Customer inquiries fetched" },
        "401": { description: "Unauthorized" },
      },
    },
    post: {
      tags: ["Customer Inquiries"],
      summary: "Submit customer property inquiry",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["propertyId", "message"],
              properties: {
                propertyId: { type: "string" },
                message: { type: "string" },
                customerName: { type: "string" },
                customerEmail: { type: "string", format: "email" },
                customerPhone: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Inquiry submitted successfully" },
      },
    },
  },
  "/customer/chats/{chat_id}": {
    get: {
      tags: ["Customer Inquiries"],
      summary: "Customer chat feed with sequential Date Dividers",
      parameters: [{ name: "chat_id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Chat feed retrieved with date dividers and embedded property card" },
        "403": { description: "Forbidden" },
      },
    },
  },
  "/customer/chats/{chat_id}/messages": {
    post: {
      tags: ["Customer Inquiries"],
      summary: "Customer sends follow-up message in chat thread",
      parameters: [{ name: "chat_id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                text: { type: "string" },
                text_content: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Message sent" },
      },
    },
  },

  // ────────────────────────── AGENT INQUIRIES DASHBOARD ──────────────────────────
  "/agent/inquiries": {
    get: {
      tags: ["Agent Dashboard"],
      summary: "Fetch agent inquiries dashboard (Table View)",
      description: "Returns managed property inquiries with strict row mapping (type, snippet, phone, UI status, relative date).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "status", in: "query", schema: { type: "string", enum: ["all", "new", "responded", "closed"] } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        "200": { description: "Agent inquiries table data retrieved" },
        "403": { description: "Forbidden" },
      },
    },
  },
  "/agent/inquiries/{inquiry_id}": {
    get: {
      tags: ["Agent Dashboard"],
      summary: "Specific Inquiry & Reply Hub for Agent",
      parameters: [{ name: "inquiry_id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Inquiry details, submitter profile card, and conversation thread" },
      },
    },
  },
  "/agent/inquiries/{inquiry_id}/replies": {
    post: {
      tags: ["Agent Dashboard"],
      summary: "Agent post reply action (Auto-transitions status to Responded/Replied)",
      parameters: [{ name: "inquiry_id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["text_content"],
              properties: { text_content: { type: "string" } },
            },
          },
        },
      },
      responses: {
        "201": { description: "Reply created and status automatically upgraded to Responded" },
      },
    },
  },

  // Notifications
  "/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "Get user notifications",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "isRead", in: "query", schema: { type: "boolean" } },
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Notifications list retrieved" },
      },
    },
  },
  "/notifications/unread-count": {
    get: {
      tags: ["Notifications"],
      summary: "Get unread notifications count for sidebar badge",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Unread count retrieved" },
      },
    },
  },
  "/notifications/{id}/read": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark single notification as read",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Marked as read" },
        "403": { description: "Forbidden (IDOR protection)" },
      },
    },
  },
  "/notifications/read-all": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark all notifications as read",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "All notifications marked as read" },
      },
    },
  },

  // Reports
  "/reports/summary": {
    get: {
      tags: ["Reports"],
      summary: "Get reports summary & transaction breakdown",
      parameters: [
        { name: "from", in: "query", schema: { type: "string", format: "date" } },
        { name: "to", in: "query", schema: { type: "string", format: "date" } },
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Reports summary retrieved" },
      },
    },
  },

  // Agent Client Management
  "/agent/clients": {
    get: {
      tags: ["Agent"],
      summary: "List associated clients (Agent only)",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "status", in: "query", schema: { type: "string", enum: ["active", "inactive"] } },
        { name: "q", in: "query", schema: { type: "string" } },
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Clients list retrieved" },
        "403": { description: "Forbidden for owners/customers" },
      },
    },
    post: {
      tags: ["Agent"],
      summary: "Link client to agent (Agent only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                clientId: { type: "string" },
                email: { type: "string", format: "email" },
                notes: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Client associated successfully" },
        "409": { description: "Client already associated" },
      },
    },
  },
  "/agent/clients/{id}": {
    get: {
      tags: ["Agent"],
      summary: "Get client details & managed properties (Agent only)",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Client details and properties fetched" },
        "404": { description: "Client relationship not found" },
      },
    },
  },

  // Profile (/me)
  "/me": {
    get: {
      tags: ["Profile"],
      summary: "Get authenticated user profile",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Profile fetched" },
      },
    },
    patch: {
      tags: ["Profile"],
      summary: "Update user profile",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
                location: { type: "string" },
                bio: { type: "string" },
                licenseNumber: { type: "string" },
                agencyName: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Profile updated" },
      },
    },
    delete: {
      tags: ["Profile"],
      summary: "Soft delete user account",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Account deactivated" },
      },
    },
  },
  "/me/avatar": {
    post: {
      tags: ["Profile"],
      summary: "Upload profile avatar",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: { avatar: { type: "string", format: "binary" } },
            },
          },
        },
      },
      responses: {
        "200": { description: "Avatar uploaded" },
      },
    },
    delete: {
      tags: ["Profile"],
      summary: "Remove profile avatar",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Avatar removed" },
      },
    },
  },
  "/me/password": {
    put: {
      tags: ["Profile"],
      summary: "Change password",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentPassword", "newPassword", "confirmPassword"],
              properties: {
                currentPassword: { type: "string" },
                newPassword: { type: "string" },
                confirmPassword: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Password changed successfully" },
        "400": { description: "Validation error or invalid current password" },
      },
    },
  },
};
