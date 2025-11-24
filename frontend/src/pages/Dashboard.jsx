import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, BookOpen, FileText, Settings, LogOut, Upload, MessageSquare, Book, Plus, Trash2, Edit2, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: Brain, label: 'Ask AI' },
    { path: '/dashboard/pdfs', icon: FileText, label: 'My PDFs' },
    { path: '/dashboard/exercises', icon: Book, label: 'Exercises' },
  ];

  React.useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchChats();
    }
  }, [location.pathname]);

  // Listen for chat updates from AskAI component
  React.useEffect(() => {
    const handleChatUpdate = () => {
      if (location.pathname === '/dashboard') {
        fetchChats();
      }
    };
    
    window.addEventListener('chatUpdated', handleChatUpdate);
    
    return () => {
      window.removeEventListener('chatUpdated', handleChatUpdate);
    };
  }, [location.pathname]);

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const response = await API.get('/chats');
      setChats(response.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleNewChat = () => {
    navigate('/dashboard', { state: { newChat: true }, replace: true });
    // Trigger a custom event to notify AskAI component
    window.dispatchEvent(new CustomEvent('chatAction', { detail: { action: 'new' } }));
  };

  const handleSelectChat = (chatId) => {
    navigate('/dashboard', { state: { chatId }, replace: true });
    // Trigger a custom event to notify AskAI component
    window.dispatchEvent(new CustomEvent('chatAction', { detail: { action: 'load', chatId } }));
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await API.delete(`/chats/${chatId}`);
      setChats(chats.filter(chat => chat._id !== chatId));
      toast.success('Chat deleted');
      navigate('/dashboard', { state: { newChat: true } });
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
    e.preventDefault();
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

  const isAskAIPage = location.pathname === '/dashboard';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex-col shadow-lg">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="bg-black p-2 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-black">Taalim AI</span>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Chat History for Ask AI Page */}
          {isAskAIPage && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chat History</h3>
                <button
                  onClick={handleNewChat}
                  className="p-1.5 text-white bg-black hover:shadow-lg rounded-lg transition-all duration-300"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
                {loadingChats ? (
                  <div className="text-xs text-gray-400 px-2 py-3">Loading chats...</div>
                ) : chats.length === 0 ? (
                  <div className="text-xs text-gray-400 px-2 py-3">No chat history yet</div>
                ) : (
                  chats.map((chat) => (
                    <motion.div
                      key={chat._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleSelectChat(chat._id)}
                      className="group relative p-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-100"
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
                          className="w-full bg-white border-2 border-primary px-2 py-1 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium text-gray-900 truncate pr-2">
                                {chat.title}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => startEditing(chat, e)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Rename"
                              >
                                <Edit2 className="w-3 h-3 text-black" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteChat(chat._id, e)}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(chat.lastMessageAt)}</span>
                            {chat.messages && (
                              <span className="ml-auto text-black font-medium">
                                {chat.messages.length} msg{chat.messages.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

          <div className="p-4 border-t border-gray-200/50 bg-white/50">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="relative w-64 bg-white/95 backdrop-blur-xl h-full shadow-2xl"
          >
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                  <div className="bg-black p-2 rounded-xl shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-black">Taalim AI</span>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-black text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="p-2 text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 rounded-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Taalim AI</span>
            </div>
            <div className="w-8" />
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-white to-blue-50/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;