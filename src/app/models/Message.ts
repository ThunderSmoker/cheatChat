import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String },
  file: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
  workspaceId: { type: String, default: 'global', required: true },
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
