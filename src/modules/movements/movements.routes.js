const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const { createMovementController, getAllMovementsController, getMovementByIdController, updateMovementController, deleteMovementController } = require("./movements.controller");

// Rutas protegidas
router.use(auth, tenant);

router.post("/", createMovementController);
router.get("/", getAllMovementsController); // soporta ?projectId=
router.get("/:id", getMovementByIdController);
router.put("/:id", updateMovementController);
router.delete("/:id", deleteMovementController);

module.exports = router;