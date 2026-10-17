export const notificationSwaggerPaths: Record<string, any> = {
  "/notifications/{id}": {
    delete: {
      tags: ["Notifications"],
      summary: "Delete notification",
      description:
        "Deletes a specific notification belonging to the authenticated user.",
      operationId: "deleteUserNotification",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Notification MongoDB ObjectId",
          example: "660c1b2f3a4b5c6d7e8f9a0b",
        },
      ],
      responses: {
        "200": {
          description: "Notification deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { description: "Unauthenticated" },
        "404": { description: "Notification not found" },
      },
    },
  },
};
