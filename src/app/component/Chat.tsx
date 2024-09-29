'use client'
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

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

  // Create a ref for the last message element
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages on page load
  const fetchMessages = async () => {
    const response = await axios.get('/api/messages');
    setMessages(response.data);
  };

  useEffect(() => {
    fetchMessages(); // Fetch all messages when the component is mounted
  }, []); // Empty dependency array ensures it runs only on component mount

  useEffect(() => {
    // Scroll to the last message when messages are updated
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message function
  const sendMessage = async () => {
    // Check if there is text or file to send
    if (!message && !file) {
      alert('Please provide a message or a file');
      return;
    } 
    let pref=file? file?.name+" " : "";
    
    const messageData = {
      user: 'Msg', // Replace with actual user data
      text: pref+message || file?.name , // Send empty string only if there is no file
      file: file ? URL.createObjectURL(file) : null,  // Handle file appropriately
    };
  
    try {
      const response = await axios.post('/api/messages', messageData, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setMessage(''); // Clear message input
      setFile(null);  // Clear file input
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => console.log('Message copied to clipboard!'))
      .catch((err) => console.error('Failed to copy message: ', err));
  };
  const deleteMessage = async (id: string) => {
    try {
      await axios.delete(`/api/messages?id=${id}`);  // Pass the message ID in the query
      setMessages(messages.filter((msg) => msg._id !== id)); // Remove message from state
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  const deleteAllMessages = async () => {
    try {
      await axios.delete('/api/messages');
      setMessages([]); // Clear messages from the frontend state
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
            ref={index === messages.length - 1 ? lastMessageRef : null} // Attach ref to the last message
            className="message"
          >
            <p>
              <span 
                className="copy-icon cursor-pointer ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => copyToClipboard(msg.text)} // Add the copy functionality
                title="Copy text"
              >
                📋
              </span>
              <span 
                className="delete-icon cursor-pointer ml-2 text-gray-500 hover:text-red-700"
                onClick={() => deleteMessage(msg._id)} // Add delete functionality
                title="Delete message"
              >
                🗑️
              </span>
              <strong>{msg.user}: <br/><br/></strong>{msg.text}
            </p>
            {msg.file && (
              <a
                href={msg.file}
                download={msg.text.split(' ')[0]}  // Set the filename to the first part of the message text
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
        
        rows={3} // You can adjust the number of rows
        style={{ maxHeight: '100px', overflowY: 'auto',color:"black" }} // Add a max height and scroll
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
    </div>
  );
};

export default Chat;
