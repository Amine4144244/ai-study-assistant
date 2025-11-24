import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Clock } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const ChatHistory = ({ onSelectChat, currentChatId, onNewChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await API.get('/chats');
      setChats(response.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await API.delete(`/chats/${chatId}`);
      setChats(chats.filter(chat => chat._id !== chatId));
      toast.success('Chat deleted');
      
      if (currentChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleEditTitle = async (chatId) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await API.patch(`/chats/${chatId}`, { title: editTitle });
      setChats(chats.map(chat => 
        chat._id === chatId ? { ...chat, title: editTitle } : chat
      ));
      setEditingId(null);
      toast.success('Chat renamed');
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to rename chat');
    }
  };

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">
            <div className="animate-pulse">Loading chats...</div>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chat history yet</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat._id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat._id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                }`}
              >
                {editingId === chat._id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleEditTitle(chat._id)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEditTitle(chat._id);
                      }
                    }}
                    className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate pr-2">
                          {chat.title}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEditing(chat, e)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat._id, e)}
                          className="p-1 hover:bg-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(chat.lastMessageAt)}</span>
                      {chat.messages && (
                        <span className="ml-auto">
                          {chat.messages.length} msg{chat.messages.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>Chat history is saved automatically</p>
      </div>
    </div>
  );
};

export default ChatHistory;
