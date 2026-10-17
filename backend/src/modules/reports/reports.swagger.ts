export const reportsSwaggerPaths: Record<string, any> = {
  "/reports": {
    get: {
      tags: ["Reports"],
      summary: "Get reports summary (root endpoint)",
      description:
        "Returns summary metrics, performance stats, and transaction distributions for Owner, Agent, or Admin within an optional date range. Root alias for /reports/summary.",
      operationId: "getReportsRootSummary",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "from",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Start date (YYYY-MM-DD)",
          example: "2026-01-01",
        },
        {
          name: "to",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "End date (YYYY-MM-DD)",
          example: "2026-12-31",
        },
      ],
      responses: {
        "200": {
          description: "Reports summary fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { description: "Unauthenticated" },
        "403": { description: "Forbidden" },
      },
    },
  },
};
