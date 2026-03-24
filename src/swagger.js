import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Backend Course API",
            version: "1.0.0",
            description:
                "A complete User management API with JWT authentication, file uploads, and Cloudinary integration.",
        },
        servers: [
            {
                url: "http://localhost:8000/api/v1",
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
