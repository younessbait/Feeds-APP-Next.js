import mongoose, { Schema } from 'mongoose';

const FeedSchema = new Schema({
  name: { type: String, required: true },
  url:  { type: String, required: true, unique: true },
  platform: { type: String, enum: ['facebook','instagram','twitter','youtube','google','website'], default: 'website', required: true },
}, { timestamps: true });
// In dev with HMR, ensure schema updates take effect
if (mongoose.models.Feed) {
  mongoose.deleteModel('Feed');
}
export default mongoose.model('Feed', FeedSchema);
