const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const { createProjectController, getAllProjectsController, getAllProjectsStatusController, getProjectByIdController, getProjectByIdBasicController, updateProjectController, deleteProjectController } = require("./projects.controller");

router.use(auth, tenant);

router.post("/", createProjectController);
router.get("/", getAllProjectsController);
router.get("/status/:status", getAllProjectsStatusController);
router.get("/:id", getProjectByIdController);
router.get("/basic/:id", getProjectByIdBasicController);
router.put("/:id", updateProjectController);
router.delete("/:id", deleteProjectController);

module.exports = router;