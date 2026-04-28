const ErrorsIndex = {
  INFO_NEEDED: "infoNeeded",
  VALIDATION_ERROR: "validationError",
  CONFLICT: "conflict",
  BAD_INFO: "badInfo",
  NOT_FOUND: "notFound",
  API_ERROR: "apiError",
  UNAUTHORIZED: "unauthorized"
};

const errorsCatalog = {
  infoNeeded: {
    status: 400,
    error: new Error("No se ha enviado información"),
  },
  validationError: {
    status: 400,
    error: new Error("Datos no válidos"),
  },
  conflict: {
    status: 409,
    error: new Error("Ya existe")
  },
  badInfo: {
    status: 400,
    error: new Error("Email o contraseña incorrectos"),
  },
  unauthorized: {
    status: 401,
    error: new Error("No autorizado"),
  }, 
  notFound: {
    status: 404,
    error: new Error("Recurso no encontrado"),
  },
  apiError: {
    status: 500,
    error: new Error("Algo ha ido mal"),
  },
};

const getError = (index) => {
  return errorsCatalog[index ?? ErrorsIndex.API_ERROR];
};

class CError extends Error {
  constructor(errorType, messageOrDetails) {
    const isDetails = Array.isArray(messageOrDetails);
    super(isDetails ? errorsCatalog[errorType]?.error.message : messageOrDetails ?? "Error desconocido");
    this.errorType = errorType;
    if (isDetails) this.details = messageOrDetails;
  }
}

module.exports = {
  ErrorsIndex,
  errorsCatalog,
  getError,
  CError,
};