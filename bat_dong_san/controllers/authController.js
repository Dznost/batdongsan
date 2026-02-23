const { User } = require("../models");
const { validationResult } = require("express-validator");

const authController = {

  showLogin: (req, res) => {
    res.render("auth/login", {
      title: "Đăng nhập - Website Rao Vặt Bất Động Sản",
      layout: "auth",
    });
  },

  login: async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        req.flash("error", errorMessages.join(", "));
        return res.redirect("/login");
      }

      const { email, password, remember } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        req.incrementAuthAttempts();
        req.flash("error", "Email hoặc mật khẩu không đúng");
        return res.redirect("/login");
      }

      if (!user.isActive) {
        req.incrementAuthAttempts();
        req.flash("error", "Tài khoản đã bị khóa");
        return res.redirect("/login");
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        req.incrementAuthAttempts();
        req.flash("error", "Email hoặc mật khẩu không đúng");
        return res.redirect("/login");
      }

      req.resetAuthAttempts();

      await user.updateLastLogin();

      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      };
      if (remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
      }

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          req.flash("error", "Có lỗi xảy ra khi đăng nhập");
          return res.redirect("/login");
        }

        req.flash("success", `Chào mừng ${user.name}!`);
        if (user.role === "admin") {
          res.redirect("/admin");
        } else {
          res.redirect("/");
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      req.flash("error", "Có lỗi xảy ra. Vui lòng thử lại");
      res.redirect("/login");
    }
  },

  showRegister: (req, res) => {
    res.render("auth/register", {
      title: "Đăng ký - Website Rao Vặt Bất Động Sản",
      layout: "auth",
    });
  },

  register: async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        req.flash("error", errorMessages.join(", "));
        return res.redirect("/register");
      }

      const { name, email, password, phone } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        req.flash("error", "Email đã được sử dụng");
        return res.redirect("/register");
      }

      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone?.trim(),
        emailVerified: true, // Auto verify for now
      };

      const user = await User.create(userData);

      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      };

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          req.flash("error", "Có lỗi xảy ra khi tạo tài khoản");
          return res.redirect("/register");
        }

        req.flash(
          "success",
          `Chào mừng ${user.name}! Tài khoản đã được tạo thành công`
        );
        res.redirect("/");
      });
    } catch (error) {
      console.error("Register error:", error);

      if (error.code === 11000) {
        req.flash("error", "Email đã được sử dụng");
      } else {
        req.flash("error", "Có lỗi xảy ra. Vui lòng thử lại");
      }

      res.redirect("/register");
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        req.flash("error", "Có lỗi xảy ra khi đăng xuất");
        return res.redirect("back");
      }

      res.clearCookie("sessionId"); // Clear session cookie with correct name
      res.redirect("/");
    });
  },

  showProfile: async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id).populate({
        path: "postsCount",
      });

      res.render("auth/profile", {
        title: "Hồ sơ cá nhân - Website Rao Vặt Bất Động Sản",
        user,
      });
    } catch (error) {
      console.error("Profile error:", error);
      req.flash("error", "Có lỗi xảy ra");
      res.redirect("/");
    }
  },

  updateProfile: async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        req.flash("error", errorMessages.join(", "));
        return res.redirect("/profile");
      }

      const { name, phone } = req.body;
      const userId = req.session.user._id;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          name: name.trim(),
          phone: phone?.trim(),
        },
        { new: true, runValidators: true }
      );

      req.session.user.name = user.name;

      req.flash("success", "Cập nhật hồ sơ thành công");
      res.redirect("/profile");
    } catch (error) {
      console.error("Update profile error:", error);
      req.flash("error", "Có lỗi xảy ra. Vui lòng thử lại");
      res.redirect("/profile");
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash("error", "Vui lòng điền đầy đủ thông tin");
        return res.redirect("/profile");
      }

      if (newPassword !== confirmPassword) {
        req.flash("error", "Mật khẩu mới không khớp");
        return res.redirect("/profile");
      }

      if (newPassword.length < 6) {
        req.flash("error", "Mật khẩu mới phải có ít nhất 6 ký tự");
        return res.redirect("/profile");
      }

      const user = await User.findById(req.session.user._id);

      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        req.flash("error", "Mật khẩu hiện tại không đúng");
        return res.redirect("/profile");
      }

      user.password = newPassword;
      await user.save();

      req.flash("success", "Đổi mật khẩu thành công");
      res.redirect("/profile");
    } catch (error) {
      console.error("Change password error:", error);
      req.flash("error", "Có lỗi xảy ra. Vui lòng thử lại");
      res.redirect("/profile");
    }
  },
};

module.exports = authController;
