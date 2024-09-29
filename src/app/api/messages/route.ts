import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Message from '../../models/Message'; // Create a message model

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI? process.env.MONGODB_URI : '');
};

export async function POST(request: Request) {
    await connectDB();
  
    // Try to parse the request body as JSON
    const data = await request.json().catch((err) => {
      console.error('Failed to parse request body as JSON', err);
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    });
  
    if (!data) return NextResponse.json({ error: 'No data received' }, { status: 400 });
  
    const newMessage = new Message({
      user: data.user,
      text: data.text,
      file: data.file || null,
    });
  
    await newMessage.save();
  
    return NextResponse.json(newMessage);
  }
  
export async function GET() {
  await connectDB();
  const messages = await Message.find();
  return NextResponse.json(messages);
}

export async function DELETE(request: Request) {
    await connectDB();
  
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
  
    try {
      if (id) {
        // Delete a specific message by ID
        const deletedMessage = await Message.findByIdAndDelete(id);
  
        if (!deletedMessage) {
          return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }
  
        return NextResponse.json({ message: 'Message deleted successfully' });
      } else {
        // Delete all messages if no ID is provided
        await Message.deleteMany(); // Delete all documents in the "messages" collection
        return NextResponse.json({ message: 'All messages deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting message(s):', error);
      return NextResponse.json({ error: 'Failed to delete message(s)' }, { status: 500 });
    }
  }