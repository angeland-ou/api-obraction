const { z } = require("zod");

const createProjectSchema = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(255, "El nombre no puede superar los 255 caracteres"),
    status: z.enum(["pending", "in_progress", "blocked", "done"])
        .default("pending"),
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
    startDate: z.string()
        .datetime({ offset: true })
        .optional(),
    endDate: z.string()
        .datetime({ offset: true })
        .optional(),
    notes: z.string()
        .optional()
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = {
    createProjectSchema, 
    updateProjectSchema
};