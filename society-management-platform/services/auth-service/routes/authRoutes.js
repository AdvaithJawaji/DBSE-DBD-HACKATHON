const express = require('express');
const router = express.Router();
const { register, getAvailableFlats, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/flats', getAvailableFlats);
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
