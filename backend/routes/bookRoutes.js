const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');
const { encryptResponse } = require('../middleware/encrypt');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBook);

// Admin routes
router.post('/', authenticate, authorize(['admin']), bookController.createBook);
router.put('/:id', authenticate, authorize(['admin']), bookController.updateBook);
router.delete('/:id', authenticate, authorize(['admin']), bookController.deleteBook);

module.exports = router;