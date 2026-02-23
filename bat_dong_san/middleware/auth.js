const { User } = require("../models");

const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  if (req.xhr || req.headers.accept?.includes("application/json")) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập để tiếp tục",
    });
  }

  req.flash("error", "Vui lòng đăng nhập để tiếp tục");
  res.redirect("/login");
};

const requireGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect("/");
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục",
      });
    }

    req.flash("error", "Vui lòng đăng nhập để tiếp tục");
    return res.redirect("/login");
  }

  if (req.session.user.role !== "admin") {

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    req.flash("error", "Bạn không có quyền truy cập");
    return res.redirect("/");
  }

  next();
};

const loadUser = async (req, res, next) => {
  if (req.session && req.session.user) {
    try {
      const user = await User.findById(req.session.user._id);
      if (user && user.isActive) {
        req.user = user;
        res.locals.user = user;
      } else {

        req.session.destroy();
        res.locals.user = null;
      }
    } catch (error) {
      console.error("Error loading user:", error);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};

const requireOwnership = (resourceModel, resourceIdParam = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {

        if (req.xhr || req.headers.accept?.includes("application/json")) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài nguyên",
          });
        }

        req.flash("error", "Không tìm thấy tài nguyên");
        return res.redirect("back");
      }

      if (req.session.user.role === "admin") {
        req.resource = resource;
        return next();
      }

      const userId = req.session.user._id;
      const resourceUserId = resource.userId || resource.user || resource._id;

      if (resourceUserId.toString() !== userId.toString()) {

        if (req.xhr || req.headers.accept?.includes("application/json")) {
          return res.status(403).json({
            success: false,
            message: "Bạn không có quyền truy cập tài nguyên này",
          });
        }

        req.flash("error", "Bạn không có quyền truy cập tài nguyên này");
        return res.redirect("back");
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Error checking ownership:", error);

      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(500).json({
          success: false,
          message: "Lỗi server",
        });
      }

      req.flash("error", "Có lỗi xảy ra");
      res.redirect("back");
    }
  };
};

const authRateLimit = {};

const rateLimitAuth = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!authRateLimit[ip]) {
      authRateLimit[ip] = {
        attempts: 0,
        resetTime: now + windowMs,
      };
    }

    const userLimit = authRateLimit[ip];

    if (now > userLimit.resetTime) {
      userLimit.attempts = 0;
      userLimit.resetTime = now + windowMs;
    }

    if (userLimit.attempts >= maxAttempts) {
      const remainingTime = Math.ceil((userLimit.resetTime - now) / 1000 / 60);

      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(429).json({
          success: false,
          message: `Quá nhiều lần thử. Vui lòng thử lại sau ${remainingTime} phút`,
        });
      }

      req.flash(
        "error",
        `Quá nhiều lần thử. Vui lòng thử lại sau ${remainingTime} phút`
      );
      return res.redirect("back");
    }

    req.incrementAuthAttempts = () => {
      userLimit.attempts++;
    };

    req.resetAuthAttempts = () => {
      delete authRateLimit[ip];
    };

    next();
  };
};

const secureSession = (req, res, next) => {

  if (req.session && req.session.user) {
    const lastRegeneration = req.session.lastRegeneration || 0;
    const now = Date.now();

    if (now - lastRegeneration > 30 * 60 * 1000) {
      const userData = req.session.user; // Save user data
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return next();
        }

        req.session.user = userData;
        req.session.lastRegeneration = now;
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
};

const requireActiveAccount = async (req, res, next) => {
  if (req.session && req.session.user) {
    try {
      const user = await User.findById(req.session.user._id);

      if (!user || !user.isActive) {
        req.session.destroy();

        if (req.xhr || req.headers.accept?.includes("application/json")) {
          return res.status(401).json({
            success: false,
            message: "Tài khoản đã bị khóa hoặc không tồn tại",
          });
        }

        req.flash("error", "Tài khoản đã bị khóa hoặc không tồn tại");
        return res.redirect("/login");
      }
    } catch (error) {
      console.error("Error checking account status:", error);
    }
  }
  next();
};

module.exports = {
  requireAuth,
  requireGuest,
  requireAdmin,
  loadUser,
  requireOwnership,
  rateLimitAuth,
  secureSession,
  requireActiveAccount,
};
