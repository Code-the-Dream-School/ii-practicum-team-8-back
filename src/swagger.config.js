const apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://team8-backend.onrender.com/api/v1"
    : "http://localhost:8000/api/v1";

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "CTD: Team-8 API",
    version: "1.0.0",
    description: "API documentation for Team-8 Project",
  },
  servers: [
    {
      url: apiUrl,
      description: "Local development server",
    },
  ],
  paths: {
    "/": {
      get: {
        summary: "Home",
        responses: {
          200: {
            description: "Successful response",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  password: {
                    type: "string",
                  },
                  email: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        security: [
          {
            csrfToken: [],
          },
        ],
        responses: {
          200: {
            description: "User registered successfully",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "User login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: {
                    type: "string",
                  },
                  email: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        summary: "Forgot Password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset initiated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/bookings": {
      post: {
        summary: "Create Booking",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  startDate: {
                    type: "string",
                    format: "date",
                  },
                  endDate: {
                    type: "string",
                    format: "date",
                  },
                  numberOfAdults: {
                    type: "integer",
                  },
                  numberOfKids: {
                    type: "integer",
                  },
                  numberOfRooms: {
                    type: "integer",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Booking created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    booking: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                        },
                      },
                    },
                    todo: {
                      type: "object",
                      properties: {
                        createdBy: {
                          type: "string",
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
      get: {
        summary: "Get All Bookings",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "List of all bookings",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/bookings/{bookingId}": {
      get: {
        summary: "Get Booking by ID",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            in: "path",
            name: "bookingId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Booking details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update Booking",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            in: "path",
            name: "bookingId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  startDate: {
                    type: "string",
                    format: "date",
                  },
                  endDate: {
                    type: "string",
                    format: "date",
                  },
                  numberOfAdults: {
                    type: "integer",
                  },
                  numberOfKids: {
                    type: "integer",
                  },
                  numberOfRooms: {
                    type: "integer",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Booking updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    booking: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                        },
                      },
                    },
                    todo: {
                      type: "object",
                      properties: {
                        createdBy: {
                          type: "string",
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
      delete: {
        summary: "Delete Booking",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            in: "path",
            name: "bookingId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          204: {
            description: "Booking deleted successfully",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      csrfToken: {
        type: "apiKey",
        in: "header",
        name: "X-CSRF-Token",
      },
    },
  },
};
