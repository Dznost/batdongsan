const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      unique: true,
      trim: true,
      minlength: [2, "Tên danh mục phải có ít nhất 2 ký tự"],
      maxlength: [50, "Tên danh mục không được vượt quá 50 ký tự"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Mô tả không được vượt quá 500 ký tự"],
    },
    icon: {
      type: String,
      trim: true,
      default: "fas fa-home",
    },
    color: {
      type: String,
      trim: true,
      default: "#007bff",
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Màu sắc phải là mã hex hợp lệ",
      ],
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },

    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, "Meta title không được vượt quá 60 ký tự"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description không được vượt quá 160 ký tự"],
    },

    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ name: 1 });

categorySchema.virtual("posts", {
  ref: "Post",
  localField: "name",
  foreignField: "category",
  match: { isApproved: true, isActive: true },
});

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
      .replace(/[èéẹẻẽêềếệểễ]/g, "e")
      .replace(/[ìíịỉĩ]/g, "i")
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
      .replace(/[ùúụủũưừứựửữ]/g, "u")
      .replace(/[ỳýỵỷỹ]/g, "y")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }
  next();
});

categorySchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug, isActive: true });
};

categorySchema.methods.updatePostsCount = async function () {
  const Post = mongoose.model("Post");
  const count = await Post.countDocuments({
    category: this.name,
    isApproved: true,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });

  this.postsCount = count;
  return this.save({ validateBeforeSave: false });
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
