'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase'; // Import storage from your Firebase config

const Chat = () => {
  interface Message {
    _id: string;
    user: string;
    text: string;
    file?: string;
    image?: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null); // New state for upload progress

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to convert URLs in text to clickable links
  const convertUrlsToLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const fetchMessages = async () => {
    const response = await axios.get('/api/messages');
    setMessages(response.data);
    setFilteredMessages(response.data);
  };

  useEffect(() => { 
    fetchMessages();
  }, []);

  // Filter messages when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchQuery, messages]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

  const sendMessage = async () => {
    if (!message && !file) {
      alert('Please provide a message or a file');
      return;
    }
  
    let fileUrl = null;
  
    if (file) {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      // Wait for the file upload to complete and get the download URL
      fileUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress); // Update the upload progress state
          },
          (error) => {
            console.error('Upload error:', error);
            setUploadProgress(null); // Reset progress on error
            reject(error); // Reject the promise on error
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(null); // Reset progress after upload completion
            resolve(downloadURL); // Resolve the promise with the download URL
          }
        );
      });
    }
  
    const pref = file ? file?.name + " " : "";
  
    // Now send the message with the file URL to your backend
    const response = await axios.post('/api/messages', {
      user: 'Msg', // Replace with actual user data
      text: pref + message || file?.name,
      file: fileUrl, // Send the Firebase download URL to the backend
    });
  
    setMessages((prevMessages) => [...prevMessages, response.data]);
    setMessage('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => console.log('Message copied to clipboard!'))
      .catch((err) => console.error('Failed to copy message: ', err));
  };

  const deleteMessage = async (id: string) => {
    try {
      await axios.delete(`/api/messages?id=${id}`);
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const deleteAllMessages = async () => {
    try {
      await axios.delete('/api/messages');
      setMessages([]);
    } catch (error) {
      console.error('Error deleting all messages:', error);
    }
  };

  return (
    <div className="chat-container max-w-4xl mx-auto p-4">
      <div className="messages space-y-4">
        {filteredMessages.map((msg, index) => (
          <div
            key={msg._id}
            ref={index === filteredMessages.length - 1 ? lastMessageRef : null}
            className="message bg-white rounded-lg shadow p-4 break-words"
          >
            <p>
              <span
                className="copy-icon cursor-pointer ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => copyToClipboard(msg.text)}
                title="Copy text"
              >
                📋
              </span>
              <span
                className="delete-icon cursor-pointer ml-2 text-gray-500 hover:text-red-700"
                onClick={() => deleteMessage(msg._id)}
                title="Delete message"
              >
                🗑️
              </span>
              <strong>{msg.user}: <br /><br /></strong>
              <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%', display: 'block' }}>
                {convertUrlsToLinks(msg.text)}
              </span>
            </p>
            {msg.file && (
              <a
                href={msg.file}
                download={msg.text.split(' ')[0]}
                target='_blank'
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 inline-block"
              >
                Download File
              </a>
            )}
            {msg.image && <img src={msg.image} alt="message" className="mt-1 rounded-lg shadow-md" />}
          </div>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        className="w-full p-2 mt-2 border border-gray-300 rounded-lg resize-none"
        rows={3}
        style={{ maxHeight: '100px', overflowY: 'auto', color: "black" }}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
        className="mt-2"
      />
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <div className="flex-1 sm:max-w-[400px] order-2 sm:order-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2 order-1 sm:order-2">
          <button
            onClick={sendMessage}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Send
          </button>

          <button
            onClick={deleteAllMessages}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Mini Loader for Upload Progress */}
      {uploadProgress !== null && (
        <div className="mt-2">
          <div className="progress-bar" style={{ width: `${uploadProgress}%`, backgroundColor: 'blue', height: '5px' }} />
          <span className="text-gray-500">{Math.round(uploadProgress)}% uploading...</span>
        </div>
      )}
    </div>
  );
};

export default Chat;
