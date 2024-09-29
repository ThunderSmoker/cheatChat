import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Message from '../../models/Message'; // Create a message model
import { getStorage, ref, deleteObject } from 'firebase/storage';
import firebaseApp from '@/app/firebase';

const storage = getStorage(firebaseApp);
const deleteFile = async (filePath: string | undefined) => {
  const fileRef = ref(storage, filePath);
  try {
    await deleteObject(fileRef);
    console.log('File successfully deleted');
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
};


const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  console.log('Connecting to MongoDB'+ process.env.MONGODB_URI? process.env.MONGODB_URI : 'mongodb://localhost:27017');
  
  await mongoose.connect(process.env.MONGODB_URI? process.env.MONGODB_URI : 'mongodb://localhost:27017');
  console.log('Connected to MongoDB');
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
      const messageToDelete = await Message.findById(id);

      if (!messageToDelete) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      // Check if the message contains a file, and handle file deletion logic
      if (messageToDelete.file) {
        // Delete file from Firebase Storage
        await deleteFileFromFirebaseStorage(messageToDelete.file);
      }

      // After file deletion, remove the message from MongoDB
      await Message.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Message and file deleted successfully' });
    } else {
      // Delete all messages if no ID is provided
      const messages = await Message.find();
      
      // Loop through all messages to delete their files (if any)
      for (const msg of messages) {
        if (msg.file) {
          await deleteFileFromFirebaseStorage(msg.file); // Delete each file from Firebase
        }
      }

      // After file deletions, remove all messages from MongoDB
      await Message.deleteMany();
      return NextResponse.json({ message: 'All messages and their files deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting message(s) or file(s):', error);
    return NextResponse.json({ error: 'Failed to delete message(s) or file(s)' }, { status: 500 });
  }
}

// Function to delete files from Firebase Storage
async function deleteFileFromFirebaseStorage(fileUrl: string) {
try {
  // Extract the Firebase Storage file path from the URL
  const filePath = extractFilePathFromUrl(fileUrl);

  // Delete the file from Firebase Storage
  await deleteFile(filePath);
  console.log(`File ${fileUrl} deleted successfully from Firebase`);
} catch (error) {
  console.error('Error deleting file from Firebase Storage:', error);
  throw new Error('Failed to delete file from Firebase Storage');
}
}

// Helper function to extract file path from Firebase Storage URL
function extractFilePathFromUrl(fileUrl: string) {
const regex = /\/o\/(.+)\?/; // Extract the part after '/o/' and before the query params
const match = fileUrl.match(regex);
return match ? decodeURIComponent(match[1]) : '';
}
