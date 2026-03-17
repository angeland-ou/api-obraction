const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = require("../config/misc/constants");

// Generamos un access token de corta duración (15min)
// El payload contiene la información del usuario que necesitamos en cada petición
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generamos un refresh token de larga duración (7 días)
// Solo contiene el userId y tokenVersion para minimizar la información expuesta
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

// Verifica access token y devuelve el payload si es válido
// Lanza una excepción si el token es inválido o ha expirado
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Verifica refresh token y devuelve el payload si es válido
// Lanza una excepción si el token es inválido o ha expirado
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};