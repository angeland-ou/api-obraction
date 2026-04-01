const { z } = require("zod");

const createMovementSchema = z.object({
    projectId: z.string()
        .uuid("El id del proyecto no es válido")
        .optional()
        .nullable(),
    amount: z.coerce.number()
        .positive("La cantidad debe ser un número positivo (el signo lo determina el tipo de movimiento)"),
    iva: z.coerce.number()
        .min(0, "El IVA no puede ser negativo")
        .default(0),
    type: z.enum(["income", "expense"], {
        errorMap: () => ({ message: "El tipo de movimiento debe ser 'income' o 'expense'" })
    }),
    concept: z.string()
        .max(500, "El concepto es demasiado largo, máx. 255 caracteres")
        .optional(),
    notes: z.string()
        .max(500, "La descripción es demasiado larga, máx. 500 caracteres")
        .optional(),
    movementDate: z.coerce.date()
        .default(() => new Date()),
});

const updateMovementSchema = createMovementSchema.partial();

module.exports = {
    createMovementSchema,
    updateMovementSchema
};