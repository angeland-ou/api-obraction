const router = require("express").Router({ mergeParams: true });
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const { createTaskController, getAllTasksController, getTaskByIdController, updateTaskController, deleteTaskController } = require("../tasks/tasks.controller");

// rutas públicas

// rutas protegidas
router.use(auth, tenant);

router.post("/", createTaskController);
router.get("/", getAllTasksController);
router.get("/:id", getTaskByIdController);
router.put("/:id", updateTaskController);
router.delete("/:id", deleteTaskController);

module.exports = router;