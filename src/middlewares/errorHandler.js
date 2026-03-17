// Creamos el manejador de errores para recibir los errores que puedan generar las peticiones de nuestra app
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Si el error tiene un estado, devolvemos el status, sino devolvemos un error interno del servidor (500)
  const status = err.status || 500;
  // Devolvemos el mensaje, y si no hay, "Error interno del servidor"
  const message = err.message || "Error interno del servidor";

  // devolvemos la respuesta JSON con el error
  res.status(status).json({
    error: {
      message,
      // si no estamos en entorno producción, devolvemos también el stack trace
      // en producción no enviamos esta información por seguridad
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;