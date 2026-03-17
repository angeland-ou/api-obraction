const bcrypt = require("bcrypt");
const { BCRYPT_SALT_ROUNDS } = require("../config/misc/constants"); // Importamos las variables de entorno

// función para hashear la contraseña
// guardaremos ese hash en la bbdd para proteger las contraseñas
const hashPassword = async (password) => {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

// función para verificar que la password insertada
// coincide con el hash de la base de datos 
// bcrypt hashea la password insertada para comprobar que coincide su hash con el de la bbdd
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };