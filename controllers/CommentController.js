import { Comment, Post } from "../models/_index.js"

const CommentController = {
  createComment: async (req, res) => {
    const { content, postId } = req.body
    const userId = req.user.userId 

    if (!postId || !content) {
      return res.status(400).json({ error: 'All fields is required' })
    }

    try {
      let comment = await Comment.create({
        content,
        user: userId,
        post: postId,
      })

      if (comment.user.toString() !== userId) {
        return res.status(403).json({ error: 'No access' })
      }

      comment = await Comment.findById(comment._id)
        .populate('user')
        .populate('post')

      await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } },
        { new: true }
      );

      res.json(comment)
    } catch (error) {
      console.log('Create comment error', error);
      return res.status(500).json({ error: 'Server error' })
    }
  },
  getAllComments: async (req, res) => {
    const { postId } = req.params

    try {
      const comments = await Comment.find(postId)
        .populate('user')
        .populate('post')
        .sort({ createdAt: -1 })
        .lean()

      return res.status(200).json(comments)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: 'Server error' })
    }
  },
  deleteComment: async (req, res) => {
    const { id } = req.params
    const { postId } = req.body
    const userId = req.user.userId

    try {
      const comment = await Comment.findByIdAndDelete(id)

      if (!comment) {
        return res.status(400).json({ error: 'This comment doesn\'t exist' })
      }

      if (comment.user.toString() !== userId) {
        return res.status(403).json({ error: 'No access' })
      }

      await Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: id } },
        { new: true }
      );

      return res.json({ comment, message: 'DELETED' })
    } catch (error) {
      console.log('Delete comment error', error);
      return res.status(500).json({ error: 'Server error' })
    }
  }
}

export default CommentController
