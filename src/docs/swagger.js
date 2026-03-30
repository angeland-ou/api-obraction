const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Obraction API",
            version: "1.0.0",
            description: "API REST para la gestión de obras y proyectos de construcción"
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local"
            },
            {
                url: "https://api.obraction.com",
                description: "Servidor de producción"
            }
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken"
                }
            }
        },
        security: [
            {
                cookieAuth: []
            }
        ]
    },
    apis: ["./src/docs/*.docs.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;