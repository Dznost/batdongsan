const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const historyController = require('../controllers/historyController');

// Lấy danh sách thông báo
router.get('/', requireAuth, historyController.getNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', requireAuth, historyController.getUnreadCount);

// Đánh dấu thông báo đã đọc
router.post('/:id/mark-as-read', requireAuth, historyController.markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.post('/mark-all-as-read', requireAuth, historyController.markAllAsRead);

module.exports = router; 