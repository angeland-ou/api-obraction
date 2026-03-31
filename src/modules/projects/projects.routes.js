const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const { createProjectController, getAllProjectsController, getProjectByIdController, updateProjectController, deleteProjectController } = require("./projects.controller");

router.use(auth, tenant);

router.post("/", createProjectController);
router.get("/", getAllProjectsController);
router.get("/:id", getProjectByIdController);
router.put("/:id", updateProjectController);
router.delete("/:id", deleteProjectController);

module.exports = router;