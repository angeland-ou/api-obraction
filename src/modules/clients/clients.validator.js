const { z } = require("zod");

// POST /api/clients

// validar campos: 
// name, surname, email, nif, notes

const createClientSchema = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(255, "El nombre no puede superar los 255 caracteres"),
    surname: z.string()
        .max(255, "El apellido no puede superar los 255 caracteres")
        .optional()
        .nullable(),
    email: z.email("La dirección de correo no es válida")
        .max(254, "El email no puede superar los 254 caracteres")
        .optional()
        .nullable(),
    nif: z.string()
        .regex(/^(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z]|[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])$/, "Introduce un formato de DNI, NIF o NIE válido")
        .optional()
        .nullable(),
    notes: z.string()
        .optional()
        .nullable(),
    phones: z.array(z.object({
        label: z.string().max(100, "Label debe ser texto, máximo 100 caracteres").optional(),
        number: z.string().max(25, "El número de teléfono no puede tener más de 25 caracteres").optional()
    })).optional()
})

const updateClientSchema = createClientSchema.partial();

module.exports = {
    createClientSchema,
    updateClientSchema
}
