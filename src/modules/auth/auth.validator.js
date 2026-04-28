const { z } = require("zod");

// Registro de usuarios
// Valido username, email, password, nif, tenantName (ya que el usuario crea el tenant en el registro)
const registerSchema = z.object({
    username: z.string()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(255, "El nombre de usuario no puede superar los 255 caracteres"),
    email: z.email("La dirección de correo no es válida")
        .max(254, "El email no puede superar los 254 caracteres"),
    nif: z.string()
        .regex(/^(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z]|[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])$/, "Introduce un formato de DNI, NIF o NIE válido"),
    password: z.string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/, "La contraseña debe tener 8-64 caracteres, mayúscula, minúscula, número y símbolo"),
    tenantName: z.string()
        .min(2, "El nombre de la empresa debe tener mínimo 2 caracteres")
        .max(255, "El nombre de empresa no puede superar los 255 caracteres"),
});

const loginSchema = z.object({
    email: z.email("La dirección de correo no es válida"),
    password: z.string().min(1, "Introduce tu contraseña"),
});

module.exports = {
    registerSchema,
    loginSchema
}