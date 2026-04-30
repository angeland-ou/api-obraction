const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const {
    getTenantController,
    updateTenantController,
    uploadLogoController,
    getLogoUrlController,
    deleteLogoController,
    getGlobalBalanceController,
    getTenantSimpleBalanceController
} = require("./tenant.controller");

router.use(auth, tenant);

router.get("/", getTenantController);
router.put("/", updateTenantController);
router.post("/logo", uploadLogoController);
router.get("/logo", getLogoUrlController);
router.delete('/logo', deleteLogoController);
router.get("/balance", getGlobalBalanceController);
router.get("/simple-balance", getTenantSimpleBalanceController);

module.exports = router;

// router.use("/tenant", require("../modules/tenant/tenant.routes"));