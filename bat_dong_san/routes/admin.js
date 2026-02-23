const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/auth");

router.use(requireAdmin);

router.get("/", adminController.dashboard);

router.get("/posts", adminController.posts);
router.post("/posts/:id/approve", adminController.approvePost);
router.post("/posts/:id/reject", adminController.rejectPost);
router.delete("/posts/:id", adminController.deletePost);

router.get("/users", adminController.users);
router.post("/users/:id/activate", adminController.activateUser);
router.post("/users/:id/deactivate", adminController.deactivateUser);
router.post("/users/:id/make-admin", adminController.makeAdmin);
router.post("/users/:id/remove-admin", adminController.removeAdmin);
router.post("/users/:id/change-password", adminController.changeUserPassword); // đổi mật khẩu
router.delete("/users/:id", adminController.deleteUser);

router.get("/categories", adminController.categories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.post("/categories/:id/activate", adminController.activateCategory);
router.post("/categories/:id/deactivate", adminController.deactivateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

module.exports = router;
