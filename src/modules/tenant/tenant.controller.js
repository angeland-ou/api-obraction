const tenantService = require("./tenant.service");
const { updateTenantSchema } = require("./tenant.validator");
const upload = require("../../config/multer");
const { CError, ErrorsIndex } = require("../../config/misc/errors");

const getTenantController = async (req, res, next) => {
    try {
        const tenant = await tenantService.getTenant(req.tenant.tenantId);
        res.status(200).json({
            success: true,
            message: "Empresa encontrada",
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

const updateTenantController = async (req, res, next) => {
    try {
        const result = updateTenantSchema.safeParse(req.body);

        if (!result.success) {
            next(new CError(ErrorsIndex.VALIDATION_ERROR, result.error.issues));
        }

        const tenant = await tenantService.updateTenant(req.tenant.tenantId, result.data);

        res.status(200).json({
            success: true,
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
            return next(new CError(ErrorsIndex.BAD_INFO, err.message));
        }

        if (!req.file) {
            return next(new CError(ErrorsIndex.INFO_NEEDED, "No se ha enviado ningún archivo"));
        }

        try {
            const tenant = await tenantService.uploadLogo(req.tenant.tenantId, req.file);

            res.status(200).json({
                success: true,
                message: "Logo actualizado correctamente",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    });
};

const getLogoUrlController = async (req, res, next) => {
    try {
        const tenant = await tenantService.getTenant(req.tenant.tenantId);

        if (!tenant.logoPath) {
            return next(new CError(ErrorsIndex.NOT_FOUND, "Sin logotipo"));
        }

        const url = await storageService.getSignedUrl('documents', tenant.logoPath);

        res.status(200).json({
            success: true,
            message: "Logo encontrado",
            data: { url }
        });

    } catch (error) {
        next(error);
    }
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

        res.status(200).json({
            success: true,
            message: "Balance encontrado",
            data: balance
        });

    } catch (error) {
        next(error);
    }
};

const getTenantSimpleBalanceController = async (req, res, next) => {
    try {
        const balance = await tenantService.getTenantSimpleBalance(req.tenant.tenantId);

        if (!balance) {
            return res.status(200).json({
                    success: true,
                    message: "Balance sin datos",
                    data: {
                        totalIncome: 0,
                        totalExpenses: 0,
                        balance: 0
                    }
                });
        }

        return res.status(200).json({
                success: true,
                message: "Balance encontrado",
                data: balance
            });


    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTenantController,
    updateTenantController,
    uploadLogoController,
    getLogoUrlController,
    getGlobalBalanceController,
    getTenantSimpleBalanceController
};