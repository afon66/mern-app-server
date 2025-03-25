import { Follows, User } from "../models/_index.js"

const FollowController = {
  followUser: async (req, res) => {
    const { following } = req.body
    const userId = req.user.userId

    if (following === userId) {
      return res.status(500).json({ error: 'You can\'t follow yourself' })
    }

    try {
      const existingSubscription = await Follows.findOne({
        follower: userId,
        following
      })

      if (existingSubscription) {
        return res.status(500).json({ error: 'The subscription already exists' })
      }

      await Follows.create({
        follower: userId,
        following
      })

      await User.findByIdAndUpdate(userId, { $addToSet: { following } });
      await User.findByIdAndUpdate(following, { $addToSet: { followers: userId } });

      res.status(201).json({ message: 'Subscription created successfully' })
    } catch (error) {
      console.log('Follow user error', error);
      return res.status(500).json({ error: 'Server error' })
    }
  },
  unfollowUser: async (req, res) => {
    const { id: following } = req.params
    const userId = req.user.userId

    try {
      const follows = await Follows.findOne({
        follower: userId,
        following
      })

      if (!follows) {
        return res.status(404).json({ error: 'You are not following this user' })
      }

      await follows.deleteOne({
        _id: follows._id
      })

      await User.findByIdAndUpdate(userId, { $pull: { following } });
      await User.findByIdAndUpdate(following, { $pull: { followers: userId } });

      res.status(200).json({ message: 'Unsubscribed successfully' })
    } catch (error) {
      console.log('Unfollow user error', error);
      return res.status(500).json({ error: 'Server error' })
    }
  }
}

export default FollowController