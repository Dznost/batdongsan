const { History } = require('../models');

const historyController = {
    // Lấy danh sách thông báo
    getNotifications: async (req, res) => {
        try {
            // Chỉ lấy thông báo của user đang đăng nhập
            const notifications = await History.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('postId', 'title _id')
                .populate('userId', 'name');

            const unreadCount = await History.getUnreadCount(req.user._id);

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    notifications,
                    unreadCount
                });
            }

            res.render('notifications', {
                title: 'Thông báo',
                notifications,
                unreadCount
            });
        } catch (error) {
            console.error('Get notifications error:', error);
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Có lỗi xảy ra khi tải thông báo'
                });
            }
            req.flash('error', 'Có lỗi xảy ra khi tải thông báo');
            res.redirect('/');
        }
    },

    // Lấy số lượng thông báo chưa đọc
    getUnreadCount: async (req, res) => {
        try {
            // Chỉ đếm thông báo chưa đọc của user đang đăng nhập
            const unreadCount = await History.countDocuments({
                userId: req.user._id,
                [`isRead.${req.user._id}`]: { $ne: true }
            });
            
            res.json({
                success: true,
                unreadCount
            });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra'
            });
        }
    },

    // Đánh dấu thông báo đã đọc
    markAsRead: async (req, res) => {
        try {
            const notificationId = req.params.id;
            const notification = await History.findOne({
                _id: notificationId,
                userId: req.user._id // Chỉ cho phép đánh dấu thông báo của chính user
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo'
                });
            }

            await notification.markAsRead(req.user._id);

            res.json({
                success: true,
                message: 'Đã đánh dấu đã đọc'
            });
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra'
            });
        }
    },

    // Đánh dấu tất cả thông báo đã đọc
    markAllAsRead: async (req, res) => {
        try {
            // Chỉ đánh dấu các thông báo của user đang đăng nhập
            const notifications = await History.find({ userId: req.user._id });
            for (const notification of notifications) {
                await notification.markAsRead(req.user._id);
            }

            res.json({
                success: true,
                message: 'Đã đánh dấu tất cả là đã đọc'
            });
        } catch (error) {
            console.error('Mark all as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra'
            });
        }
    }
};

module.exports = historyController; 