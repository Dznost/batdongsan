const mongoose = require("mongoose");
const { History } = require("../models");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/bat_dong_san"
    );
    console.log("✅ MongoDB connected for history seeding");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const setupHistoryCollection = async () => {
  try {
    console.log("🌱 Starting history collection setup...");

    // Kiểm tra xem collection History đã tồn tại chưa
    const collections = await mongoose.connection.db.listCollections().toArray();
    const historyExists = collections.some(col => col.name === 'histories');

    if (!historyExists) {
      // Tạo collection và indexes
      await History.createCollection();
      console.log("✅ Created history collection");

      // Tạo các indexes
      await History.collection.createIndex({ createdAt: -1 });
      await History.collection.createIndex({ userId: 1 });
      await History.collection.createIndex({ postId: 1 });
      console.log("✅ Created history indexes");

      // Tạo TTL index để tự động xóa documents sau 30 ngày
      await History.collection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 30 * 24 * 60 * 60 }
      );
      console.log("✅ Created TTL index for auto-deletion after 30 days");
    } else {
      console.log("ℹ️ History collection already exists");
    }

    console.log("🎉 History collection setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up history collection:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

if (require.main === module) {
  connectDB().then(() => {
    setupHistoryCollection();
  });
}

module.exports = { setupHistoryCollection, connectDB }; 