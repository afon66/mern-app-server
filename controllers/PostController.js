import { Post } from '../models/_index.js'

const PostController = {
  createPost: async (req, res) => {
    const authorId = req.user.userId
    const { content } = req.body

    if (!content) {
      res.status(400).json({ message: 'You can\'t publish an empty post' })
    }
    try {
      let post = await Post.create({
        content,
        author: authorId
      })

      post = await Post.findById(post._id).populate('author').exec()

      return res.json(post)
    } catch (error) {
      console.log('Create post error', error);
      return res.status(500).json({ error: 'Server error' })
    }
  },
  getAllPosts: async (req, res) => {
    const userId = req.user.userId

    try {
      const posts = await Post.find()
        .populate('likes')
        .populate('comments')
        .populate('author')
        .sort({ createdAt: -1 })
        .lean()

      posts.forEach(post => {
        post.likes = post.likes || []
        post.comments = post.comments || []
      })
      
      // проверяем поставил ли currentUser лайк посту

      const postWithLikeInfo = posts.map(post => ({
        ...post,
        likedByUser: post.likes.some(like => String(like.userId) === userId)
      }))

      return res.json(postWithLikeInfo)
    } catch (error) {
      console.log('Can\'t get posts', error);
      return res.status(500).json({ error: 'Server error' })
    }
  },
  getPostById: async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId

    if (!id) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    try {
      const post = await Post.findById(id)
        .populate({
          path: 'comments',
          populate: {
            path: 'user'
          }
        })
        .populate('likes')
        .populate('author')
        .lean()

      if (!post) {
        return res.status(404).json({ message: 'Post is not found' })
      }

      post.likes = post.likes || []
      post.comments = post.comments || []

      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some(like => String(like.userId) === userId)
      }

      return res.json(postWithLikeInfo)
    } catch (error) {
      console.log('Can\'t get post', error);
      return res.status(500).json({ error: 'Server error' })
    }
  },
  deletePost: async (req, res) => {
    const { id } = req.params;

    try {
      const post = await Post.findByIdAndDelete(id)

      if (!post) {
        return res.status(404).json({ error: 'Post wasn\'t found' })
      }

      res.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
      console.log('Delete post error', error);
      return res.status(500).json({ error: 'Server error' })
    }
  }
}

export default PostController