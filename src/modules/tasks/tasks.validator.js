const { z } = require("zod");

const createTaskSchema = z.object({
    title: z.string()
        .min(3, "El título debe tener al menos 3 caracteres")
        .max(255, "El título no puede superar los 255 caracteres"),
    description: z.string()
        .max(255, "La descripción no puede superar los 255 caracteres")
        .optional(),
    status: z.enum(["pending", "done"])
        .default("pending"),
    dueDate: z.coerce.date()
        .optional()
});

const updateTaskSchema = createTaskSchema.partial();

module.exports = {
    createTaskSchema,
    updateTaskSchema
};