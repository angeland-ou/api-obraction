const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const { createClientController, getAllClientsController, getClientByIdController, updateClientController, deleteClientController } = require("../clients/clients.controller");

// rutas públicas

// rutas protegidas
router.use(auth, tenant);

router.post("/", createClientController);
router.get("/", getAllClientsController);
router.get("/:id", getClientByIdController);
router.put("/:id", updateClientController);
router.delete("/:id", deleteClientController);

module.exports = router;