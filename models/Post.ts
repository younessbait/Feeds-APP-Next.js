import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema({
  feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
  title: String,
  link: { type: String, required: true, unique: true },
  publishedAt: Date,
  mediaUrl: { type: String },
  mediaKind: { type: String, enum: ['image','video'], required: false },
  seenBy: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
}, { timestamps: true });
if (mongoose.models.Post) {
  mongoose.deleteModel('Post');
}
export default mongoose.model('Post', PostSchema);
