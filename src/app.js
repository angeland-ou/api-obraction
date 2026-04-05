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


const app = express();

BigInt.prototype.toJSON = function() {
    return this.toString();
};

// Seguridad

// Usamos helmet para:
//  Proteger contra 'clickjacking'(impedimos embeber la app en un iframe)
//  Proteger contra 'sniffing' de tipos MIME mediante X-Content-Type-Options
//  Evita ataques 'XSS' cross-site scripting
//  Evitamos exponer información sensible del servidor
//  Activa la política de seguridad de contenido CSP
//  y fuerza conexiones seguras mediante HSTS en entornos de producción

/*

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], 
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "https://api.obraction.com", "https://obraction.com"],
      upgradeInsecureRequests: null,
      frameAncestors: ["'none'"],
    },
  },
    strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));


*/

// Usamos Cors para:
//  Controlar el origen de las peticiones, CORS_ORIGIN apuntará exclusivamente al dominio del frontend
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Usamos rateLimit para:
// Limitar el número de peticiones (global) y evitar ataques de fuerza bruta
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


app.use("/api", require("./routes/index"));

// 'Health check' para verificar que el servidor responde
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Manejamos los errores con el Error Handler
app.use(errorHandler);

module.exports = app;