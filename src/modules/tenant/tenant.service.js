const { prisma } = require("../../config/db");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const { handlePrismaError } = require("../../utils/handlePrismaError");
const { uploadFile, getPublicUrl } = require("../../services/storage/storageService");

const getTenant = async (tenantId) => {
    try {
        const tenant = await prisma.tenant.findFirst({
            where: { id: tenantId, deletedAt: null },
            select: {
                id: true,
                name: true,
                slug: true,
                nif: true,
                email: true,
                address: true,
                website: true,
                phone1: true,
                phone2: true,
                logoPath: true,
                primaryColor: true,
                description: true,
                createdAt: true
            }
        });

        if (!tenant) {
              throw new CError(ErrorsIndex.NOT_FOUND, "Empresa no encontrada");
        }
        
        if (tenant.logoPath) {
            tenant.logoUrl = getPublicUrl("company", tenant.logoPath);
        }

        return tenant;

    } catch (error) {
        handlePrismaError(error);
    }
};

const uploadLogo = async (tenantId, file) => {
    try {
        const ext = file.mimetype === "image/png" ? "png" : "jpg";
        const storagePath = `${tenantId}/logo/logo.${ext}`;

        await uploadFile("company", storagePath, file.buffer, file.mimetype, true);

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                logoPath: storagePath,
                updatedAt: new Date()
            },
            select: {
                id: true,
                logoPath: true
            }
        });

        return tenant;

    } catch (error) {
        handlePrismaError(error);
    }
};

const updateTenant = async (tenantId, data, file = null) => {
    try {
        const existingTenant = await prisma.tenant.findFirst({
            where: { id: tenantId, deletedAt: null }
        });

        if (!existingTenant) {
            throw new CError(ErrorsIndex.NOT_FOUND, "Empresa no encontrada");
        }

        if(file){
            await uploadLogo(tenantId, file);
        }

        // Verificar slug único si se cambia
        if (data.slug && data.slug !== existingTenant.slug) {
            const slugExists = await prisma.tenant.findFirst({
                where: { slug: data.slug }
            });
            if (slugExists) {
                throw new CError(ErrorsIndex.CONFLICT, "El slug debe ser diferente");
            }
        }

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                ...data,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                slug: true,
                nif: true,
                email: true,
                address: true,
                website: true,
                phone1: true,
                phone2: true,
                logoPath: true,
                primaryColor: true,
                description: true,
                updatedAt: true
            }
        });

        return tenant;

    } catch (error) {
        handlePrismaError(error);
    }
};

// const getGlobalBalance = async (tenantId, projectId = null, dateFrom = null, dateTo = null, order = "desc") => {
//     try {
//         const where = {
//             tenantId,
//             deletedAt: null
//         };

//         if (projectId) where.projectId = projectId;

//         if (dateFrom || dateTo) {
//             where.movementDate = {};

//             if (dateFrom) {
//                 // que empiece a las 00:00:00.000
//                 const start = new Date(dateFrom);
//                 start.setHours(0, 0, 0, 0);
//                 where.movementDate.gte = start;
//             }

//             if (dateTo) {
//                 // que termine a las 23:59:59.999
//                 const end = new Date(dateTo);
//                 end.setHours(23, 59, 59, 999);
//                 where.movementDate.lte = end;
//             }
//         }

//         const movements = await prisma.movement.findMany({
//             where,
//             orderBy: { movementDate: order },
//             select: {
//                 amount: true,
//                 ivaAmount: true,
//                 total: true,
//                 type: true,
//                 project: {
//                     select: { name: true }
//                 }
//             }
//         });

//         let totalIncome = 0;
//         let totalExpense = 0;

//         let totalIncomeIva = 0;
//         let totalExpenseIva = 0;

//         for (const mov of movements) {
//             const total = Number(mov.amount) || 0;
//             const totalConIva = Number(mov.total) || 0;

//             if (mov.type === "income") {
//                 totalIncome += total;
//                 totalIncomeIva += totalConIva;
//             } else {
//                 totalExpense += total;
//                 totalExpenseIva += totalConIva;
//             }
//         }

//         const projectsNumber = await prisma.project.count({
//             where: { tenantId, deletedAt: null }
//         });

//         const pendingTasks = await prisma.task.count({
//             where: { tenantId, status: "pending", deletedAt: null }
//         });

//         return {
//             // Neto
//             totalBalance: totalIncome - totalExpense,
//             totalIncome,
//             totalExpense,
            
//             // Con IVA
//             totalBalanceIva: totalIncomeIva - totalExpenseIva,
//             totalIncomeIva,
//             totalExpenseIva,
            
//             projectsNumber,
//             pendingTasks
//         };

//     } catch (error) {
//         handlePrismaError(error);
//     }
// };

const getGlobalBalance = async (tenantId) => {
    try {
        const balance = await prisma.$queryRaw`
            SELECT total_income, total_expenses, balance
            FROM v_tenant_balance
            WHERE tenant_id = ${tenantId}::uuid
        `;

        const income = await prisma.$queryRaw`
            SELECT total_amount, total_iva, total_with_iva
            FROM v_tenant_income
            WHERE tenant_id = ${tenantId}::uuid
        `;

        const expense = await prisma.$queryRaw`
            SELECT total_amount, total_iva, total_with_iva
            FROM v_tenant_expenses
            WHERE tenant_id = ${tenantId}::uuid
        `;

        const projectsNumber = await prisma.project.count({
            where: { tenantId, deletedAt: null }
        });

        const pendingTasks = await prisma.task.count({
            where: { tenantId, status: "pending", deletedAt: null }
        });

        const b = balance[0];
        const inc = income[0];
        const exp = expense[0];

        return {
            balance: b ? Number(b.balance) : 0,
            totalIva: (inc ? Number(inc.total_iva) : 0) - (exp ? Number(exp.total_iva) : 0),
            balanceWithIva: (inc ? Number(inc.total_with_iva) : 0) - (exp ? Number(exp.total_with_iva) : 0),

            income: inc ? Number(inc.total_amount) : 0,
            incomeWithIva: inc ? Number(inc.total_with_iva) : 0,

            expense: exp ? Number(exp.total_amount) : 0,
            expenseWithIva: exp ? Number(exp.total_with_iva) : 0,

            projectsNumber,
            pendingTasks
        };

    } catch (error) {
        handlePrismaError(error);
    }
};

const getTenantSimpleBalance = async (tenantId) => {
    try {
        const data = await prisma.$queryRaw`
            SELECT total_income, total_expenses, balance
            FROM v_tenant_balance
            WHERE tenant_id = ${tenantId}::uuid
        `;

        if (!data || data.length === 0) return null;
        
        const result = {
            totalIncome: Number(data[0].total_income),
            totalExpenses: Number(data[0].total_expenses),
            balance: Number(data[0].balance)
        }

        return result;


    } catch (error) {
        handlePrismaError(error);
    }
}

module.exports = {
    getTenant,
    updateTenant,
    uploadLogo,
    getGlobalBalance,
    getTenantSimpleBalance
};