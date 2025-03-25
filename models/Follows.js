import { Schema, model } from "mongoose";

const FollowSchema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: 'User' },
  following : { type: Schema.Types.ObjectId, ref: 'User' },
})

export default model('Follows', FollowSchema)