const { z } = require("zod");

const createMovementSchema = z.object({
    projectId: z.string()
        .uuid("El id del proyecto no es válido")
        .optional()
        .nullable(),
    amount: z.preprocess(
        v => {
            if (v === '' || v === null || v === undefined) return undefined;
            const n = Number(v);
            return isNaN(n) ? undefined : n;
        },
        z.number({ error: "Introduce un importe válido" })
            .positive("La cantidad debe ser un número positivo")
    ),
    iva: z.coerce.number()
        .min(0, "El IVA no puede ser negativo")
        .default(0),
    type: z.enum(["income", "expense"], {
        errorMap: () => ({ message: "El tipo de movimiento debe ser 'income' o 'expense'" })
    }),
    concept: z.string()
        .max(500, "El concepto es demasiado largo, máx. 500 caracteres")
        .optional(),
    notes: z.string()
        .max(500, "La descripción es demasiado larga, máx. 500 caracteres")
        .optional(),
    movementDate: z.preprocess(
        v => (v === '' || v === null) ? undefined : v,
        z.coerce.date().default(() => new Date())
    ),
});

const updateMovementSchema = createMovementSchema.partial().extend({
    amount: z.preprocess(
        v => {
            if (v === null || v === undefined) return undefined;
            if (v === '') return NaN;
            const n = Number(v);
            return isNaN(n) ? NaN : n;
        },
        z.number({ error: "Introduce un importe válido" })
            .positive("La cantidad debe ser un número positivo")
            .optional()
    )
});
module.exports = {
    createMovementSchema,
    updateMovementSchema
};