const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const { createMovementController, getAllMovementsController, getMovementByIdController, updateMovementController, deleteMovementController } = require("./movements.controller");
const upload = require("../../config/multer");

// Rutas protegidas
router.use(auth, tenant);

router.post("/", upload.single("file"), createMovementController);
router.put("/:id", upload.single("file"), updateMovementController);

router.get("/", getAllMovementsController); // soporta ?projectId=
router.get("/:id", getMovementByIdController);
router.delete("/:id", deleteMovementController);

module.exports = router;