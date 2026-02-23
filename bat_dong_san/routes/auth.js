const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { userValidation, handleValidationErrors } = require('../middleware/validation');
const { requireAuth, requireGuest, rateLimitAuth } = require('../middleware/auth');

router.use(rateLimitAuth(5, 15 * 60 * 1000)); // 5 attempts per 15 minutes

router.get('/login', requireGuest, authController.showLogin);
router.post('/login', 
    requireGuest,
    userValidation.login,
    handleValidationErrors,
    authController.login
);

router.get('/register', requireGuest, authController.showRegister);
router.post('/register',
    requireGuest,
    userValidation.register,
    handleValidationErrors,
    authController.register
);

router.post('/logout', requireAuth, authController.logout);
router.get('/logout', requireAuth, authController.logout); // Support GET for convenience

router.get('/profile', requireAuth, authController.showProfile);
router.post('/profile',
    requireAuth,
    userValidation.updateProfile,
    handleValidationErrors,
    authController.updateProfile
);

router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
