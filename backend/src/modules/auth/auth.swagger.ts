export const authSwaggerPaths: Record<string, any> = {
  "/auth/signup/gmail": {
    post: {
      tags: ["Auth"],
      summary: "Sign up or login with Google",
      description:
        "Verifies Google OAuth ID Token. If the user already exists, logs them in. If not, creates an account with the chosen role (Owner: 1, Customer: 2, Agent: 3) and marks email as confirmed. Returns access and refresh JWT tokens.",
      operationId: "signupWithGmail",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["idToken", "role"],
              properties: {
                idToken: {
                  type: "string",
                  description: "Google OAuth ID Token from Google Sign-In SDK",
                },
                role: {
                  type: "integer",
                  enum: [1, 2, 3],
                  description: "Target role: 1 for Owner, 2 for Customer, 3 for Agent",
                  example: 2,
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Authenticated successfully with tokens",
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
                          loginTokens: {
                            $ref: "#/components/schemas/LoginResponse",
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
        "400": { description: "Invalid Google ID token or validation error" },
      },
    },
  },
  "/auth/rotateToken": {
    post: {
      tags: ["Auth"],
      summary: "Rotate refresh token",
      description:
        "Exchanges a valid Refresh Token for a new access and refresh token pair. Includes single-use enforcement, race-condition grace period, and reuse detection.",
      operationId: "rotateRefreshToken",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Token rotation done",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/LoginResponse" },
                    },
                  },
                ],
              },
            },
          },
        },
        "401": { description: "Refresh token expired or invalid" },
        "409": { description: "Token reuse detected or refresh in progress" },
      },
    },
  },
};
