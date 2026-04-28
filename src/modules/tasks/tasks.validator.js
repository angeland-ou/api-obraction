const { z } = require("zod");

const optionalDatetime = (message) => z.preprocess(
    v => (v === '' || v === null) ? undefined : v,
    z.string().datetime({ offset: true, message }).optional()
);

const createTaskSchema = z.object({
    title: z.string()
        .min(3, "El título debe tener al menos 3 caracteres")
        .max(255, "El título no puede superar los 255 caracteres"),
    description: z.string()
        .max(255, "La descripción no puede superar los 255 caracteres")
        .optional(),
    status: z.preprocess(
    v => (v === '' || v === null) ? undefined : v,
    z.enum(["pending", "done"], {
        errorMap: () => ({ message: "Estado no válido" })
    }).default("pending")
),
    dueDate: z.preprocess(
        v => (v === '' || v === null) ? null : v,
        z.union([
            z.null(),
            z.coerce.date({ error: "La fecha no es válida" }).optional()
        ])
    )
});

const updateTaskSchema = createTaskSchema.partial();

module.exports = {
    createTaskSchema,
    updateTaskSchema
};