'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';


interface ChatProps {
  workspaceId?: string;
}

const Chat = ({ workspaceId = 'global' }: ChatProps) => {
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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to highlight search terms
  const highlightSearchTerm = (text: string) => {
    if (!searchQuery || searchQuery.trim() === '') return text;
    
    const searchRegex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(searchRegex);
    
    return parts.map((part, i) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Helper function to convert URLs to links and highlight search terms
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
            {highlightSearchTerm(part)}
          </a>
        );
      }
      return highlightSearchTerm(part);
    });
  };

  const fetchMessages = async () => {
    const response = await axios.get(`/api/messages?workspaceId=${workspaceId}`);
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
      toast.error('Please provide a message or a file');
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
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            setUploadProgress(null);
            toast.error('Failed to upload file');
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(null);
            toast.success('File uploaded successfully');
            resolve(downloadURL);
          }
        );
      });
    }

    const pref = file ? file?.name + " " : "";

    try {
      const response = await axios.post(`/api/messages?workspaceId=${workspaceId}`, {
        user: 'Msg',
        text: pref + message || file?.name,
        file: fileUrl,
      });

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setMessage('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Message copied to clipboard!'))
      .catch(() => toast.error('Failed to copy message'));
  };

  const deleteMessage = async (id: string) => {
    try {
      await axios.delete(`/api/messages?id=${id}&workspaceId=${workspaceId}`);
      setMessages(messages.filter((msg) => msg._id !== id));
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error(error);
    }
  };

  const deleteAllMessages = async () => {
    try {
      await axios.delete(`/api/messages?workspaceId=${workspaceId}`);
      setMessages([]);
      toast.success('All messages deleted successfully');
    } catch (error) {
      toast.error('Failed to delete messages');
      console.error(error);
    }
  };

  return (
    <div className="chat-container max-w-4xl mx-auto p-4">
      <Toaster position="top-right" />
      <div className="messages space-y-4">
        {filteredMessages.map((msg, index) => (
          <div
            key={msg._id}
            ref={index === filteredMessages.length - 1 ? lastMessageRef : null}
            className="message bg-white rounded-lg shadow p-4 break-words hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-1">
              <strong className="text-blue-700">{msg.user}</strong>
              <div className="flex space-x-2">
                <button
                  className="transition-all duration-200 hover:scale-110 group bg-transparent p-0"
                  onClick={() => copyToClipboard(msg.text)}
                  title="Copy text"
                >
                  <img
                    src="/copy.png"
                    alt="Copy"
                    className="w-6 h-6 object-contain opacity-60 group-hover:opacity-100 transition-all"
                  />
                </button>
                <button
                  className="transition-all duration-200 hover:bg-red-800 hover:scale-110 group bg-transparent p-0"
                  onClick={() => deleteMessage(msg._id)}
                  title="Delete message"
                >
                  <img
                    src="/delete.svg"
                    alt="Delete"
                    className="w-6 h-6 object-contain opacity-60 group-hover:opacity-100 transition-all"
                  />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%', display: 'block' }}>
                {convertUrlsToLinks(msg.text)}
              </span>
            </div>
            {msg.file && (
              <a
                href={msg.file}
                download={msg.text.split(' ')[0]}
                target='_blank'
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-full shadow-sm hover:shadow mt-3 inline-flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download File
              </a>
            )}
            {msg.image && <img src={msg.image} alt="message" className="mt-1 rounded-lg shadow-md" />}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          rows={3}
          style={{ maxHeight: '150px', overflowY: 'auto', color: "black" }}
        />

        <div className="flex items-center space-x-2">
          <label className="flex-1 cursor-pointer">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
              <span className="text-xl">📎</span>
              {file ? (
                <span className="truncate">{file.name}</span>
              ) : (
                <span>Choose a file</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  setFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 sm:max-w-[400px] order-2 sm:order-1">
            <div className="relative w-full">

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-all text-sm font-medium"
                >
                  ×
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="text-sm text-gray-500  py-1 absolute">
                Found: {filteredMessages.length} messages
              </div>
            )}
            <div className='mb-2'></div>
          </div>

          <div className="flex gap-2 order-1 sm:order-2 h-[42px]">
          <button
              onClick={sendMessage}
              className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-6 rounded-full shadow-sm hover:shadow transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1 px-4 whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <strong>Send</strong>
            </button>

            <button
              onClick={deleteAllMessages}
              className="flex-1 sm:w-auto flex-nowrap bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-6 rounded-full shadow-sm hover:shadow transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1 px-4 whitespace-nowrap "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <strong>Delete All</strong>
            </button>
          </div>
        </div>
      </div>

      {uploadProgress !== null && (
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-sm text-blue-600 mt-1">
            Uploading: {Math.round(uploadProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default Chat;
