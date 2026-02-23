const { User, Post, Category, History } = require("../models");
const bcrypt = require('bcrypt'); // đổi mật khẩu

const adminController = {
  dashboard: async (req, res) => {
    try {
      const [
        totalUsers,
        totalPosts,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        activeUsers,
        inactiveUsers,
        totalCategories,
      ] = await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Post.countDocuments({ isApproved: null }),
        Post.countDocuments({ isApproved: true }),
        Post.countDocuments({ isApproved: false }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        Category.countDocuments(),
      ]);

      const recentPosts = await Post.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

      res.render("admin/dashboard", {
        title: "Admin Dashboard",
        layout: "admin",
        stats: {
          totalUsers,
          totalPosts,
          pendingPosts,
          approvedPosts,
          rejectedPosts,
          activeUsers,
          inactiveUsers,
          totalCategories,
        },
        recentPosts,
        recentUsers,
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      req.flash("error", "Có lỗi xảy ra khi tải dashboard");
      res.redirect("/");
    }
  },

  posts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status === "pending") filter.isApproved = null;
      else if (req.query.status === "approved") filter.isApproved = true;
      else if (req.query.status === "rejected") filter.isApproved = false;

      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
        ];
      }

      const [posts, totalPosts] = await Promise.all([
        Post.find(filter)
          .populate("userId", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Post.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalPosts / limit);

      res.render("admin/posts", {
        title: "Quản lý tin đăng",
        layout: "admin",
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
        },
        filters: req.query,
      });
    } catch (error) {
      console.error("Admin posts error:", error);
      req.flash("error", "Có lỗi xảy ra khi tải danh sách tin đăng");
      res.redirect("/admin");
    }
  },

  approvePost: async (req, res) => {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
      ).populate('userId', 'name');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Tin đăng không tồn tại",
        });
      }

      // Tạo thông báo khi tin được duyệt
      await History.create({
        postId: post._id,
        userId: post.userId._id,
        title: post.title
      });

      res.json({
        success: true,
        message: "Đã duyệt tin đăng thành công",
      });
    } catch (error) {
      console.error("Approve post error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  rejectPost: async (req, res) => {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { isApproved: false },
        { new: true }
      );

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Tin đăng không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã từ chối tin đăng",
      });
    } catch (error) {
      console.error("Reject post error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  deletePost: async (req, res) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Tin đăng không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã xóa tin đăng thành công",
      });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  users: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status === "active") filter.isActive = true;
      else if (req.query.status === "inactive") filter.isActive = false;
      if (req.query.role === "admin") filter.role = "admin";
      else if (req.query.role === "user") filter.role = "user";

      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ];
      }

      const [users, totalUsers] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalUsers / limit);

      res.render("admin/users", {
        title: "Quản lý người dùng",
        layout: "admin",
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
        },
        filters: req.query,
      });
    } catch (error) {
      console.error("Admin users error:", error);
      req.flash("error", "Có lỗi xảy ra khi tải danh sách người dùng");
      res.redirect("/admin");
    }
  },

  activateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã kích hoạt tài khoản thành công",
      });
    } catch (error) {
      console.error("Activate user error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  deactivateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã vô hiệu hóa tài khoản",
      });
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  makeAdmin: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: "admin" },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã cấp quyền admin thành công",
      });
    } catch (error) {
      console.error("Make admin error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  removeAdmin: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: "user" },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã thu hồi quyền admin",
      });
    } catch (error) {
      console.error("Remove admin error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa tài khoản của chính mình",
        });
      }

      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      await Post.deleteMany({ userId: req.params.id });

      res.json({
        success: true,
        message: "Đã xóa người dùng thành công",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  // đổi mật khẩu
  changeUserPassword: async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword.trim(), 12);
      
      // Update the password directly (bypass the pre-save middleware)
      await User.updateOne(
        { _id: req.params.id },
        { password: hashedPassword }
      );

      res.json({
        success: true,
        message: "Đã đổi mật khẩu thành công",
      });
    } catch (error) {
      console.error("Change user password error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi đổi mật khẩu",
      });
    }
  },
  //end đổi mật khẩu

  categories: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status === "active") filter.isActive = true;
      else if (req.query.status === "inactive") filter.isActive = false;

      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
        ];
      }

      const [categories, totalCategories] = await Promise.all([
        Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Category.countDocuments(filter),
      ]);

      for (let category of categories) {
        category.postCount = await Post.countDocuments({
          category: category.name,
        });
      }

      const totalPages = Math.ceil(totalCategories / limit);

      res.render("admin/categories", {
        title: "Quản lý danh mục",
        layout: "admin",
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalCategories,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
        },
        filters: req.query,
      });
    } catch (error) {
      console.error("Admin categories error:", error);
      req.flash("error", "Có lỗi xảy ra khi tải danh sách danh mục");
      res.redirect("/admin");
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục không được để trống",
        });
      }

      const existingCategory = await Category.findOne({
        name: name.trim(),
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Danh mục này đã tồn tại",
        });
      }

      const category = await Category.create({
        name: name.trim(),
        description: description ? description.trim() : "",
        isActive: true,
      });

      res.json({
        success: true,
        message: "Tạo danh mục thành công",
        category,
      });
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tạo danh mục",
      });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục không được để trống",
        });
      }

      const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục này đã tồn tại",
        });
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: name.trim(),
          description: description ? description.trim() : "",
        },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Cập nhật danh mục thành công",
        category,
      });
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi cập nhật danh mục",
      });
    }
  },

  activateCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã kích hoạt danh mục thành công",
      });
    } catch (error) {
      console.error("Activate category error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  deactivateCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã vô hiệu hóa danh mục",
      });
    } catch (error) {
      console.error("Deactivate category error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra",
      });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const postsCount = await Post.countDocuments({
        category: req.params.id,
      });

      if (postsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Không thể xóa danh mục này vì có ${postsCount} tin đăng đang sử dụng`,
        });
      }

      const category = await Category.findByIdAndDelete(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Đã xóa danh mục thành công",
      });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xóa danh mục",
      });
    }
  },
};

module.exports = adminController;
