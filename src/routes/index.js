const router = require("express").Router();

router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/clients", require("../modules/clients/clients.routes"));
router.use("/projects", require("../modules/projects/projects.routes"));
router.use("/projects/:projectId/tasks", require("../modules/tasks/tasks.routes"));
router.use("/movements", require("../modules/movements/movements.routes"));

module.exports = router;