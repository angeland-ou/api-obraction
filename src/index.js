// Imports
const { PORT, CORS_ORIGIN } = require("./config/misc/constants"); // Importamos las variables de entorno
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const { testDbConnection } = require("./config/db");

const app = express();


// Seguridad

// Usamos helmet para:
//  Proteger contra 'clickjacking'(impedimos embeber la app en un iframe)
//  Proteger contra 'sniffing' de tipos MIME mediante X-Content-Type-Options
//  Evita ataques 'XSS' cross-site scripting
//  Evitamos exponer información sensible del servidor
//  Activa la política de seguridad de contenido CSP
//  y fuerza conexiones seguras mediante HSTS en entornos de producción
app.use(helmet());

// Usamos Cors para:
//  Controlar el origen de las peticiones, CORS_ORIGIN apuntará exclusivamente al dominio del frontend
app.use(cors({ origin: CORS_ORIGIN }));

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

app.use("/api", require("./routes/index"));

// Hacemos un 'Health check' para verificar que el servidor responde
// app.get("/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// Manejamos los errores con el Error Handler
app.use(errorHandler);

// Arrancamos el servidor comprobando que la conexión con la base de datos funciona correctamente
const startServer = async () => {
  try {
    await testDbConnection();
    app.listen(PORT, () => {
      console.log(`🔥 Servidor corriendo en puerto ${PORT} 🚀`);
    });
  } catch (error) {
    console.log("Error al arracar el servidor: ", error.message);
    process.exit(1);
  }
};

startServer();