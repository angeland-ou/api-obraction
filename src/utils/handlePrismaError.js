const { CError, ErrorsIndex } = require("../config/misc/errors");

const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      throw new CError(ErrorsIndex.CONFLICT, "Ya existe un registro con esos datos");
    case 'P2025':
      throw new CError(ErrorsIndex.NOT_FOUND, "El registro no existe");
    case 'P2003':
      throw new CError(ErrorsIndex.BAD_INFO, "Referencia a un registro que no existe");
    default:
      throw error;
  }
};

module.exports = { handlePrismaError };