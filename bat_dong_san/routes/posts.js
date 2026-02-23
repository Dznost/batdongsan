const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const {
  postValidation,
  handleValidationErrors,
} = require("../middleware/validation");
const { requireAuth } = require("../middleware/auth");
const { uploadPostImages, processImages } = require("../middleware/upload");

router.get("/", postsController.index);
router.get("/create", requireAuth, postsController.create);
router.post(
  "/",
  requireAuth,
  uploadPostImages,
  processImages,
  postValidation.create,
  handleValidationErrors,
  postsController.store
);
router.get("/:id", postsController.show);
router.get("/:id/edit", requireAuth, postsController.edit);
router.post(
  "/:id/update",
  requireAuth,
  uploadPostImages,
  processImages,
  postValidation.update,
  handleValidationErrors,
  postsController.update
);

router.delete("/:id", requireAuth, postsController.destroy);

module.exports = router;
