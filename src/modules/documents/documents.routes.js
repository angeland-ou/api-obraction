const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const { getDocumentUrlController, deleteDocumentController } = require("./documents.controller");
 
router.use(auth, tenant);
 
router.get("/:id/url", getDocumentUrlController);

router.delete("/:id", deleteDocumentController);
 
module.exports = router;