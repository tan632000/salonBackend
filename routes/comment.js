const express = require('express');

const router = express.Router();

const { createComment, getCommentByUserId, getCommentBySalonId } = require('../controllers/Comment.js')

// Create comment
router.post('/', createComment);

router.get('/:userId/user', getCommentByUserId);

router.get('/:salonId/salon', getCommentBySalonId);

module.exports = router