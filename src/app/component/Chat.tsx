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
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null); // New state for upload progress

  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    const response = await axios.get('/api/messages');
    setMessages(response.data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message && !file) {
      alert('Please provide a message or a file');
      return;
    }

    let fileUrl = null;

    if (file) {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor the upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress); // Update the upload progress state
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadProgress(null); // Reset progress on error
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          fileUrl = downloadURL;
          setUploadProgress(null); // Reset progress after upload completion
        }
      );
    }

    const pref = file ? file?.name + " " : "";

    const response = await axios.post('/api/messages', {
      user: 'Msg', // Replace with actual user data
      text: pref + message || file?.name,
      file: fileUrl,
    });

    setMessages((prevMessages) => [...prevMessages, response.data]);
    setMessage('');
    setFile(null);
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
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={msg._id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className="message"
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
              <strong>{msg.user}: <br /><br /></strong>{msg.text}
            </p>
            {msg.file && (
              <a
                href={msg.file}
                download={msg.text.split(' ')[0]}
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
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />
      <div className="buttons mt-2">
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Send
        </button>

        <button
          onClick={deleteAllMessages}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
        >
          Delete All
        </button>
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
