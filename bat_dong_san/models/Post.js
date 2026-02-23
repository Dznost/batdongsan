const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề là bắt buộc"],
      trim: true,
      minlength: [10, "Tiêu đề phải có ít nhất 10 ký tự"],
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    description: {
      type: String,
      required: [true, "Mô tả là bắt buộc"],
      trim: true,
      minlength: [50, "Mô tả phải có ít nhất 50 ký tự"],
      maxlength: [2000, "Mô tả không được vượt quá 2000 ký tự"],
    },
    price: {
      type: Number,
      required: [true, "Giá là bắt buộc"],
      min: [0, "Giá không được âm"],
      max: [999999999999, "Giá quá lớn"],
    },
    area: {
      type: Number,
      required: [true, "Diện tích là bắt buộc"],
      min: [1, "Diện tích phải lớn hơn 0"],
      max: [10000, "Diện tích không được vượt quá 10,000 m²"],
    },
    address: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
      trim: true,
      minlength: [10, "Địa chỉ phải có ít nhất 10 ký tự"],
      maxlength: [500, "Địa chỉ không được vượt quá 500 ký tự"],
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      trim: true,
      match: [/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"],
    },
    type: {
      type: String,
      required: [true, "Loại hình là bắt buộc"],
      enum: {
        values: ["bán", "cho thuê"],
        message: 'Loại hình phải là "bán" hoặc "cho thuê"',
      },
    },
    category: {
      type: String,
      required: [true, "Loại bất động sản là bắt buộc"],
      enum: {
        values: [
          "chung cư",
          "nhà riêng",
          "đất nền",
          "nhà mặt phố",
          "biệt thự",
          "shophouse",
          "kho xưởng",
          "văn phòng",
        ],
        message: "Loại bất động sản không hợp lệ",
      },
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /\.(jpg|jpeg|png|gif|svg)$/i.test(v);
          },
          message: "File ảnh phải có định dạng jpg, jpeg, png, gif hoặc svg",
        },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
    },
    isApproved: {
      type: Boolean,
      default: null, // null = chờ duyệt, true = đã duyệt, false = từ chối
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Lý do từ chối không được vượt quá 500 ký tự"],
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: function () {

        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description không được vượt quá 160 ký tự"],
    },

    coordinates: {
      lat: {
        type: Number,
        min: [-90, "Latitude phải từ -90 đến 90"],
        max: [90, "Latitude phải từ -90 đến 90"],
      },
      lng: {
        type: Number,
        min: [-180, "Longitude phải từ -180 đến 180"],
        max: [180, "Longitude phải từ -180 đến 180"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.index({ userId: 1 });
postSchema.index({ type: 1 });
postSchema.index({ category: 1 });
postSchema.index({ isApproved: 1 });
postSchema.index({ isActive: 1 });
postSchema.index({ price: 1 });
postSchema.index({ area: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ views: -1 });
postSchema.index({ isFeatured: -1, createdAt: -1 });
postSchema.index({ expiresAt: 1 });

postSchema.index(
  {
    title: "text",
    description: "text",
    address: "text",
  },
  {
    weights: {
      title: 10,
      description: 5,
      address: 1,
    },
  }
);

postSchema.index({ type: 1, category: 1, isApproved: 1, isActive: 1 });
postSchema.index({ price: 1, area: 1, type: 1 });

postSchema.virtual("formattedPrice").get(function () {
  if (!this.price) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(this.price);
});

postSchema.virtual("pricePerSqm").get(function () {
  if (!this.price || !this.area) return 0;
  return Math.round(this.price / this.area);
});

postSchema.virtual("statusText").get(function () {
  if (this.isApproved === true) return "Đã duyệt";
  if (this.isApproved === false) return "Từ chối";
  return "Chờ duyệt";
});

postSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
});

postSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug =
      this.title
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
        .trim("-") +
      "-" +
      Date.now();
  }
  next();
});

postSchema.statics.findApproved = function () {
  return this.find({
    isApproved: true,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

postSchema.statics.findPending = function () {
  return this.find({
    isApproved: null,
    isActive: true,
  });
};

postSchema.statics.search = function (query, filters = {}) {
  const searchQuery = {
    isApproved: true,
    isActive: true,
    expiresAt: { $gt: new Date() },
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (filters.type) searchQuery.type = filters.type;
  if (filters.category) searchQuery.category = filters.category;
  if (filters.minPrice) searchQuery.price = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    searchQuery.price = searchQuery.price || {};
    searchQuery.price.$lte = filters.maxPrice;
  }
  if (filters.minArea) searchQuery.area = { $gte: filters.minArea };
  if (filters.maxArea) {
    searchQuery.area = searchQuery.area || {};
    searchQuery.area.$lte = filters.maxArea;
  }

  return this.find(searchQuery);
};

postSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

postSchema.methods.approve = function (adminId) {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = undefined;
  return this.save();
};

postSchema.methods.reject = function (adminId, reason) {
  this.isApproved = false;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
