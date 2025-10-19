import mongoose, { Schema } from 'mongoose';

const AccountSchema = new Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });
if (mongoose.models.Account) {
  mongoose.deleteModel('Account');
}
export default mongoose.model('Account', AccountSchema);
