const Comment = require('../models/Comment.js');

// Create a new comment
async function createComment(req, res) {
  const {salonId, stylistId, userId, comment, stylistStars, salonStars} = req.body
  const newComment = new Comment({
    salonId,
    stylistId,
    userId,
    comment,
    stylistStars,
    salonStars,
  });

  try {
    await newComment.save();
    console.log(`Comment created: ${newComment}`);
    return res.status(201).json({
      newComment
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getCommentByUserId(req, res) {
  try {
    const userId = req.params.userId;
    const comments = await Comment.find({ userId });
    if (!comments) {
      return res.status(404).json({ error: 'Comments not found' });
    }
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getCommentBySalonId(req, res) {
  try {
    const {salonId} = req.params;
    const comments = await Comment.find({ salonId }).populate('userId', 'firstName lastName photo');
    if (!comments) {
      return res.status(404).json({ error: 'Comments not found' });
    }
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  createComment,
  getCommentByUserId,
  getCommentBySalonId
}
