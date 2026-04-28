const { z } = require("zod");


const optionalDatetime = (message) => z.preprocess(
    v => (v === '' || v === null) ? undefined : v,
    z.string().datetime({ offset: true, message }).optional()
);

const createProjectSchema = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(255, "El nombre no puede superar los 255 caracteres"),
    status: z.preprocess(
        v => {
            return (v === '' || v === null) ? undefined : v;
        },
        z.enum(["pending", "in_progress", "blocked", "done"], {
            errorMap: () => ({ message: "Estado no válido" })
        }).default("pending")
    ),
    clientId: z.string()
        .uuid("El cliente no es válido")
        .optional(),
    address: z.string()
        .max(500, "La dirección no puede superar los 500 caracteres")
        .optional(),
    lat: z.number()
        .min(-90).max(90)
        .optional(),
    long: z.number()
        .min(-180).max(180)
        .optional(),
    startDate: optionalDatetime("La fecha de inicio no tiene un formato válido"),
    endDate: optionalDatetime("La fecha de fin no tiene un formato válido" ),
    notes: z.string()
        .optional()
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = {
    createProjectSchema, 
    updateProjectSchema
};