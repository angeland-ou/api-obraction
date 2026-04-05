const { z } = require("zod");

const updateTenantSchema = z.object({
    name: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(255, "El nombre no puede superar los 255 caracteres")
        .optional(),
    slug: z.string()
        .min(2, "El slug debe tener al menos 2 caracteres")
        .max(100, "El slug no puede superar los 100 caracteres")
        .regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones")
        .optional(),
    nif: z.string()
        .regex(/^(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z]|[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])$/, "Introduce un NIF válido")
        .optional(),
    email: z.email("El email no es válido")
        .max(254)
        .optional(),
    address: z.string()
        .max(500)
        .optional(),
    website: z.string()
        .max(500)
        .url("La URL no es válida")
        .optional(),
    phone1: z.string()
        .max(30)
        .optional(),
    phone2: z.string()
        .max(30)
        .optional(),
    primaryColor: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "El color no es válido, debe ser un color hexadecimal")
        .optional(),
    description: z.string()
        .optional()
});

module.exports = { updateTenantSchema };