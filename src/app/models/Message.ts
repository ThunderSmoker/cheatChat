import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String },
  file: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
