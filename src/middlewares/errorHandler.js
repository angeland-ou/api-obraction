const { CError, errorsCatalog } = require("../config/misc/errors");
// Manejador de errores para recibir errores en las peticiones de nuestra app
const errorHandler = (err, req, res, next) => {

  console.error(`[${new Date().toISOString()}] ${err.message}`, err.stack);
  const isCError = err instanceof CError;
  const catalogError = isCError ? errorsCatalog[err.errorType] : null;


  const status = catalogError?.status || err.status || 500;
  const message = isCError ? err.message : "Error interno del servidor";

  res.status(status).json({
      success: false,
      error: {
      message,
      ...(err.details && { details: err.details }),
      // si no estamos en entorno producción, devolvemos también el stack trace
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;