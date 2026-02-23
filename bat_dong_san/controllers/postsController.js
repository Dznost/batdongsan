const { Post, Category, User, History } = require("../models");
const { validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

const postsController = {

  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const filter = {
        isApproved: true,
        isActive: true,
        expiresAt: { $gt: new Date() },
      };

      if (req.query.type) filter.type = req.query.type;
      if (req.query.category) filter.category = req.query.category;
      if (req.query.minPrice)
        filter.price = { $gte: parseInt(req.query.minPrice) };
      if (req.query.maxPrice) {
        filter.price = filter.price || {};
        filter.price.$lte = parseInt(req.query.maxPrice);
      }
      if (req.query.minArea)
        filter.area = { $gte: parseInt(req.query.minArea) };
      if (req.query.maxArea) {
        filter.area = filter.area || {};
        filter.area.$lte = parseInt(req.query.maxArea);
      }

      if (req.query.keyword) {
        filter.$text = { $search: req.query.keyword };
      }

      let sort = { createdAt: -1 }; // Default: newest first
      if (req.query.sort === "price_asc") sort = { price: 1 };
      if (req.query.sort === "price_desc") sort = { price: -1 };
      if (req.query.sort === "area_asc") sort = { area: 1 };
      if (req.query.sort === "area_desc") sort = { area: -1 };

      const [posts, totalPosts, categories] = await Promise.all([
        Post.find(filter)
          .populate("userId", "name phone")
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Post.countDocuments(filter),
        Category.findActive(),
      ]);

      const totalPages = Math.ceil(totalPosts / limit);
      res.render("posts/index", {
        title: "Danh sách bất động sản",
        posts,
        categories,
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
        query: req.query,
      });
    } catch (error) {
      console.error("Posts index error:", error);
      req.flash("error", "Có lỗi xảy ra khi tải danh sách tin đăng");
      res.redirect("/");
    }
  },

  show: async (req, res) => {
    try {
      const postId = req.params.id;

      const post = await Post.findById(postId).populate(
        "userId",
        "name phone email createdAt"
      );

      if (!post) {
        req.flash("error", "Tin đăng không tồn tại");
        return res.redirect("/posts");
      }

      if (!post.isApproved || !post.isActive) {

        if (
          req.user &&
          req.user._id.toString() === post.userId._id.toString()
        ) {
          req.flash(
            "info",
            "Tin đăng này chưa được duyệt hoặc đã bị ẩn. Bạn có thể chỉnh sửa tin đăng."
          );
          return res.redirect(`/posts/${post._id}/edit`);
        }
        req.flash("error", "Tin đăng không tồn tại hoặc đã bị xóa");
        return res.redirect("/posts");
      }

      await post.incrementViews();

      const relatedPosts = await Post.find({
        _id: { $ne: postId },
        category: post.category,
        isApproved: true,
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
        .populate("userId", "name")
        .limit(4)
        .sort({ createdAt: -1 });

      res.render("posts/show", {
        title: "Chi tiết tin đăng",
        pageTitle: post.title,
        post,
        relatedPosts,
        isOwner:
          req.user && req.user._id.toString() === post.userId._id.toString(),
      });
    } catch (error) {
      console.error("Post show error:", error);
      req.flash("error", "Có lỗi xảy ra khi tải tin đăng");
      res.redirect("/posts");
    }
  },

  create: async (req, res) => {
    try {
      const categories = await Category.findActive();

      res.render("posts/create", {
        title: "Đăng tin mới",
        categories,
      });
    } catch (error) {
      console.error("Post create form error:", error);
      req.flash("error", "Có lỗi xảy ra");
      res.redirect("/");
    }
  },

  store: async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        req.flash("error", errorMessages.join(", "));
        return res.redirect("/posts/create");
      }

      const {
        title,
        description,
        price,
        area,
        address,
        phone,
        type,
        category,
      } = req.body;

      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          images.push(`/uploads/${file.filename}`);
        });
      }

      const postData = {
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price),
        area: parseInt(area),
        address: address.trim(),
        phone: phone.trim(),
        type,
        category,
        images,
        userId: req.user._id,
        isApproved: null, // Pending approval
      };

      const post = await Post.create(postData);

      req.flash("success", "Đăng tin thành công! Tin đăng đang chờ duyệt");
      res.redirect(`/posts/${post._id}`);
    } catch (error) {
      console.error("Post store error:", error);
      req.flash("error", "Có lỗi xảy ra khi đăng tin");
      res.redirect("/posts/create");
    }
  },

  edit: async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);

      if (!post) {
        req.flash("error", "Tin đăng không tồn tại");
        return res.redirect("/my-posts");
      }

      if (
        req.user.role !== "admin" &&
        post.userId.toString() !== req.user._id.toString()
      ) {
        req.flash("error", "Bạn không có quyền chỉnh sửa tin đăng này");
        return res.redirect("/my-posts");
      }

      const categories = await Category.findActive();

      res.render("posts/edit", {
        title: "Chỉnh sửa tin đăng",
        post,
        categories,
      });
    } catch (error) {
      console.error("Post edit form error:", error);
      req.flash("error", "Có lỗi xảy ra");
      res.redirect("/my-posts");
    }
  },

  update: async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);

      if (!post) {
        req.flash("error", "Tin đăng không tồn tại");
        return res.redirect("/my-posts");
      }

      if (
        req.user.role !== "admin" &&
        post.userId.toString() !== req.user._id.toString()
      ) {
        req.flash("error", "Bạn không có quyền chỉnh sửa tin đăng này");
        return res.redirect("/my-posts");
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        req.flash("error", errorMessages.join(", "));
        return res.redirect(`/posts/${postId}/edit`);
      }

      const {
        title,
        description,
        price,
        area,
        address,
        phone,
        type,
        category,
      } = req.body;

      let images = post.images || [];
      if (req.files && req.files.length > 0) {

        req.files.forEach((file) => {
          images.push(`/uploads/${file.filename}`);
        });
      }

      if (req.body.removeImages) {
        const imagesToRemove = Array.isArray(req.body.removeImages)
          ? req.body.removeImages
          : [req.body.removeImages];

        images = images.filter((img) => !imagesToRemove.includes(img));

        for (const imgPath of imagesToRemove) {
          try {
            await fs.unlink(path.join(__dirname, "../public", imgPath));
          } catch (err) {
            console.error("Error deleting image:", err);
          }
        }
      }

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price),
        area: parseInt(area),
        address: address.trim(),
        phone: phone.trim(),
        type,
        category,
        images,
        isApproved: null, // Reset approval status
      };

      await Post.findByIdAndUpdate(postId, updateData, {
        new: true,
        runValidators: true,
      });

      req.flash(
        "success",
        "Cập nhật tin đăng thành công! Tin đăng đang chờ duyệt lại"
      );
      res.redirect(`/posts/${postId}`);
    } catch (error) {
      console.error("Post update error:", error);
      req.flash("error", "Có lỗi xảy ra khi cập nhật tin đăng");
      res.redirect(`/posts/${req.params.id}/edit`);
    }
  },

  destroy: async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);

      if (!post) {

        if (req.xhr || req.headers.accept?.includes("application/json")) {
          return res.status(404).json({
            success: false,
            message: "Tin đăng không tồn tại",
          });
        }
        req.flash("error", "Tin đăng không tồn tại");
        return res.redirect("/my-posts");
      }

      if (
        req.user.role !== "admin" &&
        post.userId.toString() !== req.user._id.toString()
      ) {

        if (req.xhr || req.headers.accept?.includes("application/json")) {
          return res.status(403).json({
            success: false,
            message: "Bạn không có quyền xóa tin đăng này",
          });
        }
        req.flash("error", "Bạn không có quyền xóa tin đăng này");
        return res.redirect("/my-posts");
      }

      if (post.images && post.images.length > 0) {
        for (const imgPath of post.images) {
          try {
            await fs.unlink(path.join(__dirname, "../public", imgPath));
          } catch (err) {
            console.error("Error deleting image:", err);
          }
        }
      }

      await Post.findByIdAndDelete(postId);

      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.json({
          success: true,
          message: "Xóa tin đăng thành công",
        });
      }

      req.flash("success", "Xóa tin đăng thành công");
      res.redirect("/my-posts");
    } catch (error) {
      console.error("Post delete error:", error);

      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(500).json({
          success: false,
          message: "Có lỗi xảy ra khi xóa tin đăng",
        });
      }

      req.flash("error", "Có lỗi xảy ra khi xóa tin đăng");
      res.redirect("/my-posts");
    }
  },

  myPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const filter = { userId: req.user._id };

      if (req.query.status === "approved") filter.isApproved = true;
      else if (req.query.status === "pending") filter.isApproved = null;
      else if (req.query.status === "rejected") filter.isApproved = false;

      const [posts, totalPosts] = await Promise.all([
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalPosts / limit);

      res.render("posts/my-posts", {
        title: "Tin đăng của tôi",
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
      console.error("My posts error:", error);
      req.flash("error", "Có lỗi xảy ra khi tải danh sách tin đăng");
      res.redirect("/");
    }
  },
};

module.exports = postsController;
