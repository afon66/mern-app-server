import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import { toPng } from 'jdenticon';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { Follows, User } from '../models/_index.js';
import mongoose from 'mongoose';
dotenv.config()

// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All field is required' })
    }

    try {
      const existingUser = await User.findOne({ email })

      if (existingUser) {
        return res.status(400).json({ error: `Email ${email} already exists` })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const png = toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`
      const avatarPath = path.join(__dirname, '../uploads', avatarName)
      fs.writeFileSync(avatarPath, png)

      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        avatarUrl: `/uploads/${avatarName}`,
      })

      return res.json(user)
    } catch (error) {
      console.error('Error in register', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {

      return res.status(400).json({ message: 'All field is required' })
    }
    try {
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(400).json({ error: 'Wrong email or password' })
      }

      const validPass = await bcrypt.compare(password, user.password)

      if (!validPass) {
        return res.status(400).json({ error: 'Wrong email or password' })
      }

      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY)

      return res.json({ token })
    } catch (error) {
      console.error('Login error', error)
      return res.status(500).json({ message: 'All field is required' })
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId

    try {
      const user = await User.findById(id)
        .populate('followers')
        .populate('following')
        .lean()

      if (!user) {
        return res.status(404).json({ error: 'Can\'t find this user' })
      }

      const isFollowing = await Follows.findOne({
        follower: userId,
        following: id
      })
      res.json({
        ...user,
        isFollowing: Boolean(isFollowing)
      })

    } catch (error) {
      return res.status(500).json({ error: 'Server error' })
    }
  },
  // update doesn't work
  updateUser: async (req, res) => {
    const { id } = req.params
    const { email, name, bio, location, dateOfBirth } = req.body

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path
    }

    if (id !== req.user.userId) {
      res.status(403).json({ error: 'You have no access to do changes, invalid token' })
    }

    try {

      if (email) {
        const existingUser = await User.findOne({ email })

        if (existingUser && existingUser._id !== id) {
          return res.status(400).json({ error: 'Email already taken' })
        }
      }

      const user = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            email: email || undefined,
            name: name || undefined,
            avatarUrl: filePath ? `/${filePath}` : undefined,
            dateOfBirth: dateOfBirth || undefined,
            bio: bio || undefined,
            location: location || undefined,
          }
        },
        { new: true }
      )

      return res.json(user)
    } catch (error) {
      console.error('Updated user error', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
  current: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId)
        .populate('followers')
        .populate('following');

      if (!user) {
        return res.status(400).json({ error: 'User doesn\'t find' })
      }

      return res.json(user)

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' })
    }
  },
}

export default UserController