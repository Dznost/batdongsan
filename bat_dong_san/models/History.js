const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['post_approved'],
        default: 'post_approved',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    isRead: {
        type: Map,
        of: Boolean,
        default: new Map()
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // Tự động xóa sau 30 ngày
    }
}, {
    timestamps: true
});

// Index để tối ưu query
historySchema.index({ createdAt: -1 });
historySchema.index({ userId: 1 });
historySchema.index({ postId: 1 });

// Phương thức để đánh dấu đã đọc cho một user
historySchema.methods.markAsRead = function(userId) {
    this.isRead.set(userId.toString(), true);
    return this.save();
};

// Phương thức để lấy thông báo chưa đọc cho một user
historySchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({
        [`isRead.${userId}`]: { $ne: true }
    });
};

// Phương thức để lấy danh sách thông báo mới nhất
historySchema.statics.getLatest = function(userId, limit = 10) {
    return this.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('postId', 'title slug')
        .populate('userId', 'name');
};

const History = mongoose.model('History', historySchema);

module.exports = History; 