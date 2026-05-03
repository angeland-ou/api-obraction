// Imports
const { CORS_ORIGIN } = require("./config/misc/constants"); // Importamos cors_origin de las variables de entorno
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const { getError, ErrorsIndex } = require("./config/misc/errors");

const app = express();

BigInt.prototype.toJSON = function () {
    return this.toString();
};

// Seguridad

// Confiamos en el proxy de Cloudflare
// Render garantiza que la petición viene de su propia infraestructura o de Cloudflare
if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "https://api.obraction.com", "https://obraction.com", "https://www.obraction.com"],
            upgradeInsecureRequests: null,
            frameAncestors: ["'none'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    },
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    }
}));

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: { error: "Se ha superado el límite peticiones, intenta más tarde" }
}));

// Parsing y logs
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Docs Swagger solo si no es production
if (process.env.NODE_ENV !== 'production') {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api/documents', require('./modules/documents/documents.routes'));

app.use("/api", require("./routes/index"));

// verificar que el servidor responde
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

//  errores de endpoints que no se encuentran
app.use((req, res, next) => {
    next(getError(ErrorsIndex.NOT_FOUND));
});

app.use(errorHandler);

module.exports = app;