import { Like, Post } from '../models/_index.js'

const LikeController = {
  likePost: async (req, res) => {
    const userId = req.user.userId
    const { postId } = req.body

    if (!postId) {
      return res.status(400).json({ error: 'You can\'t like this post' })
    }

    try {
      const existingLike = await Like.findOne({ userId, postId })

      if (existingLike) {
        return res.status(400).json({ error: 'You already liked it' })
      }

      const like = await Like.create({
        postId,
        userId
      })

      await Post.findByIdAndUpdate(
        postId,
        { $push: { likes: like._id } },
        { new: true }
      )

      res.json(like)
    } catch (error) {
      console.log('Create like error', error);
      return res.status(500).json({ error: 'Server error' })
    }
  },
  unlikePost: async (req, res) => {
    const userId = req.user.userId
    const { id: postId } = req.params

    if (!postId) {
      return res.status(400).json({ error: 'Post doesn\'t exist' })
    }

    try {
      const existingLike = await Like.findOne({ userId, postId })

      if (!existingLike) {
        return res.status(400).json({ error: 'First like it, after unlike' })
      }

      const like = await Like.findOneAndDelete({ userId, postId })

      await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: existingLike._id } },
        { new: true }
      )

      res.json({ like, message: 'Unliked successfully' })
    } catch (error) {
      console.log('Unlike error', error);
      return res.status(500).json({ error: 'Server error' })
    }

  }
}

export default LikeController