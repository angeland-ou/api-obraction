const tenantService = require("./tenant.service");
const { updateTenantSchema } = require("./tenant.validator");
const upload = require("../../config/multer");

const getTenantController = async (req, res, next) => {
    try {
        const tenant = await tenantService.getTenant(req.tenant.tenantId);
        res.status(200).json({ data: tenant });
    } catch (error) {
        next(error);
    }
};

const updateTenantController = async (req, res, next) => {
    try {
        const result = updateTenantSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Datos no válidos",
                details: result.error.errors
            });
        }

        const tenant = await tenantService.updateTenant(req.tenant.tenantId, result.data);

        res.status(200).json({
            message: "Datos de la empresa actualizados correctamente",
            data: tenant
        });

    } catch (error) {
        next(error);
    }
};

const uploadLogoController = async (req, res, next) => {
    const logoUpload = upload.single("logo");

    logoUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No se ha enviado ningún archivo" });
        }

        try {
            const tenant = await tenantService.uploadLogo(req.tenant.tenantId, req.file);

            res.status(200).json({
                message: "Logo actualizado correctamente",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    });
};

const getGlobalBalanceController = async (req, res, next) => {
    try {
        const { projectId, dateFrom, dateTo, order } = req.query;

        const balance = await tenantService.getGlobalBalance(
            req.tenant.tenantId,
            projectId || null,
            dateFrom || null,
            dateTo || null,
            order || "desc"
        );

        res.status(200).json({ data: balance });

    } catch (error) {
        next(error);
    }
};

const getTenantSimpleBalanceController = async (req, res, next) => {
    try {
        const balance = await tenantService.getTenantSimpleBalance(req.tenant.tenantId);

        if (!balance) {
            res.status(200)
            .json({
                data: balance
            });
        }

        res.status(200)
        .json({
            data: { 
                totalIncome: 0,
                totalExpenses: 0,
                balance: 0
            }
        });

    } catch (error) {
         next(error);
    }
}

module.exports = {
    getTenantController,
    updateTenantController,
    uploadLogoController,
    getGlobalBalanceController,
    getTenantSimpleBalanceController
};