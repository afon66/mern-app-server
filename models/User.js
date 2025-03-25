import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    avatarUrl: { type: String },
    dateOfBirth: { type: Date },
    bio: { type: String },
    location: { type: String },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post", required: true }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like', required: true }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', required: true }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  },
  {
    timestamps: true,
  }
)

export default model('User', UserSchema)