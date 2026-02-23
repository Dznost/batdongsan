const { body, validationResult } = require("express-validator");

const userValidation = {
  register: [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Tên phải có từ 2-50 ký tự")
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
      .withMessage("Tên chỉ được chứa chữ cái và khoảng trắng"),

    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .normalizeEmail()
      .toLowerCase(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số"
      ),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Xác nhận mật khẩu không khớp");
      }
      return true;
    }),

    body("phone")
      .optional()
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Số điện thoại phải có 10-11 chữ số"),
  ],

  login: [
    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .normalizeEmail()
      .toLowerCase(),

    body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),
  ],

  updateProfile: [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Tên phải có từ 2-50 ký tự")
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
      .withMessage("Tên chỉ được chứa chữ cái và khoảng trắng"),

    body("phone")
      .optional()
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Số điện thoại phải có 10-11 chữ số"),
  ],
};

const postValidation = {
  create: [
    body("title")
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage("Tiêu đề phải có từ 10-200 ký tự"),

    body("description")
      .trim()
      .isLength({ min: 50, max: 2000 })
      .withMessage("Mô tả phải có từ 50-2000 ký tự"),

    body("price")
      .isNumeric()
      .withMessage("Giá phải là số")
      .isFloat({ min: 0, max: 999999999999 })
      .withMessage("Giá không hợp lệ"),

    body("area")
      .isNumeric()
      .withMessage("Diện tích phải là số")
      .isFloat({ min: 1, max: 10000 })
      .withMessage("Diện tích phải từ 1-10,000 m²"),

    body("address")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Địa chỉ phải có từ 10-500 ký tự"),

    body("phone")
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Số điện thoại phải có 10-11 chữ số"),

    body("type")
      .isIn(["bán", "cho thuê"])
      .withMessage('Loại hình phải là "bán" hoặc "cho thuê"'),

    body("category")
      .isIn([
        "chung cư",
        "nhà riêng",
        "đất nền",
        "nhà mặt phố",
        "biệt thự",
        "shophouse",
        "kho xưởng",
        "văn phòng",
      ])
      .withMessage("Loại bất động sản không hợp lệ"),
  ],

  update: [
    body("title")
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage("Tiêu đề phải có từ 10-200 ký tự"),

    body("description")
      .trim()
      .isLength({ min: 50, max: 2000 })
      .withMessage("Mô tả phải có từ 50-2000 ký tự"),

    body("price")
      .isNumeric()
      .withMessage("Giá phải là số")
      .isFloat({ min: 0, max: 999999999999 })
      .withMessage("Giá không hợp lệ"),

    body("area")
      .isNumeric()
      .withMessage("Diện tích phải là số")
      .isFloat({ min: 1, max: 10000 })
      .withMessage("Diện tích phải từ 1-10,000 m²"),

    body("address")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Địa chỉ phải có từ 10-500 ký tự"),

    body("phone")
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Số điện thoại phải có 10-11 chữ số"),

    body("type")
      .isIn(["bán", "cho thuê"])
      .withMessage('Loại hình phải là "bán" hoặc "cho thuê"'),

    body("category")
      .isIn([
        "chung cư",
        "nhà riêng",
        "đất nền",
        "nhà mặt phố",
        "biệt thự",
        "shophouse",
        "kho xưởng",
        "văn phòng",
      ])
      .withMessage("Loại bất động sản không hợp lệ"),
  ],
};

const adminValidation = {
  approvePost: [
    body("postId").isMongoId().withMessage("ID bài đăng không hợp lệ"),
  ],

  rejectPost: [
    body("postId").isMongoId().withMessage("ID bài đăng không hợp lệ"),

    body("reason")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Lý do từ chối phải có từ 10-500 ký tự"),
  ],
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: errorMessages,
      });
    }

    req.flash("error", errorMessages.join(", "));
    return res.redirect("back");
  }

  next();
};

const sanitizeInput = (req, res, next) => {

  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  };

  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  next();
};

module.exports = {
  userValidation,
  postValidation,
  adminValidation,
  handleValidationErrors,
  sanitizeInput,
};
