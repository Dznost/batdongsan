const express = require("express");
const session = require("express-session");
const { engine } = require("express-handlebars");
const path = require("path");
const handlebarsHelpers = require("./config/handlebars-helpers");
const { connectDB } = require("./config/database");
const flash = require("./middleware/flash");
const {
  loadUser,
  secureSession,
  requireActiveAccount,
} = require("./middleware/auth");
const { sanitizeInput } = require("./middleware/validation");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars setup
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: handlebarsHelpers,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    name: "sessionId", // Custom session name
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax", // CSRF protection
    },
  })
);

// Security and utility middleware
app.use(flash);
app.use(sanitizeInput);
app.use(secureSession);
app.use(requireActiveAccount);
app.use(loadUser);

// MongoDB connection
connectDB();

// Import models
const { User, Post, Category } = require("./models");

// Import routes
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const adminRoutes = require("./routes/admin");
const notificationsRoutes = require("./routes/notifications");

// Routes
app.use("/", authRoutes);
app.use("/posts", postsRoutes);
app.use("/admin", adminRoutes);
app.use("/notifications", notificationsRoutes);

// My posts route
app.get(
  "/my-posts",
  require("./middleware/auth").requireAuth,
  require("./controllers/postsController").myPosts
);
app.get("/", async (req, res) => {
  try {
    // Get latest approved posts
    const posts = await Post.findApproved()
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(6);

    // Get categories
    const categories = await Category.findActive();

    res.render("index", {
      title: "Trang chủ - Website Rao Vặt Bất Động Sản",
      user: req.session.user,
      posts,
      categories,
    });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.render("index", {
      title: "Trang chủ - Website Rao Vặt Bất Động Sản",
      user: req.session.user,
      posts: [],
      categories: [],
    });
  }
});

// Test route to check database
app.get("/test-db", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const categoryCount = await Category.countDocuments();
    const approvedPosts = await Post.countDocuments({ isApproved: true });
    const pendingPosts = await Post.countDocuments({ isApproved: null });

    res.json({
      success: true,
      data: {
        users: userCount,
        posts: postCount,
        categories: categoryCount,
        approvedPosts,
        pendingPosts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Debug session route
app.get("/debug-session", (req, res) => {
  res.json({
    session: req.session,
    sessionID: req.sessionID,
    user: req.session?.user || null,
    cookies: req.headers.cookie,
  });
});

// Error handling middleware (must be last)
const { notFound, errorHandler } = require("./middleware/errorHandler");
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = app;
