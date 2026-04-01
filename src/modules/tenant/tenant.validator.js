const { z } = require("zod");

const updateTenantSchema = z.object({
    name: z.string()
        .min(3, "El nombre de la empresa debe tener al menos 3 caracteres")
        .max(100, "El nombre es demasiado largo"),

    slug: z.string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "El slug solo puede contener minúsculas, números y guiones"),

    // datos fiscales opcionales
    nif: z.string()
        .regex(/^(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z]|[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])$/, "Introduce un formato de DNI, NIF o NIE válido")
        .optional()
        .nullable(),

    address: z.string().max(255)
        .optional()
        .nullable(),
    
    email: z.email("La dirección de correo no es válida")
        .max(254, "El email no puede superar los 254 caracteres")
        .optional()
        .nullable(),

    website: z.url("La URL no es válida")
        .optional()
        .nullable(),

    phone1: z.string()
        .max(20)
        .optional()
        .nullable(),

    phone2: z.string()
        .max(20)
        .optional()
        .nullable(),

    // logotipo
    logoPath: z.url("La URL del logo no es válida")
        .optional()
        .nullable(),

    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{3}){1,2}$/, "El color debe ser un formato hexadecimal válido (#FF5733)")
        .optional()
        .nullable(),
        
    description: z.string().max(500, "La descripción es demasiado larga, máximo 500 caracteres")
        .optional()
        .nullable(),

    // el admin podrá desactivar o activar la empresa
    isActive: z.boolean()
        .optional()
});

const updateTenantSchemaFinal = updateTenantSchema.partial();

module.exports = {
    updateTenantSchema: updateTenantSchemaFinal
};