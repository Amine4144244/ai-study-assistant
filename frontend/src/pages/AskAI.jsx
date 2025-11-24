import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, FileText, Languages, BookOpen, Upload, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const AskAI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('darija');
  const [selectedPDF, setSelectedPDF] = useState('');
  const [pdfs, setPdfs] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const languages = [
    { value: 'darija', label: 'Darija' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'french', label: 'French' },
    { value: 'english', label: 'English' }
  ];

  useEffect(() => {
    fetchPDFs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle chat selection from Dashboard sidebar
  useEffect(() => {
    const handleChatAction = (event) => {
      const { action, chatId } = event.detail;
      if (action === 'new') {
        handleNewChat();
      } else if (action === 'load' && chatId) {
        loadChat(chatId);
      }
    };
    
    window.addEventListener('chatAction', handleChatAction);
    
    return () => {
      window.removeEventListener('chatAction', handleChatAction);
    };
  }, []);

  const fetchPDFs = async () => {
    try {
      const response = await API.get('/pdfs');
      setPdfs(response.data.pdfs);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      toast.error('Could not fetch your PDFs.');
    }
  };

  const createNewChat = async () => {
    try {
      const response = await API.post('/chats', {
        title: 'New Chat',
        language: selectedLanguage,
        pdfId: selectedPDF || null
      });
      setCurrentChatId(response.data.chat._id);
      setMessages([]);
      // Notify Dashboard to refresh chat list
      window.dispatchEvent(new CustomEvent('chatUpdated'));
      return response.data.chat._id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create new chat');
      return null;
    }
  };

  const loadChat = async (chatId) => {
    try {
      const response = await API.get(`/chats/${chatId}`);
      const chat = response.data.chat;
      
      setCurrentChatId(chat._id);
      setSelectedLanguage(chat.language);
      setSelectedPDF(chat.pdfId?._id || '');
      
      // Convert chat messages to the format used by the UI
      const loadedMessages = chat.messages.map((msg, index) => ({
        id: `${chat._id}-${index}`,
        text: msg.content,
        sender: msg.role,
        timestamp: new Date(msg.timestamp)
      }));
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const saveMessageToChat = async (role, content, chatIdArg = null) => {
    try {
      // Prefer explicit chatIdArg, otherwise use currentChatId, otherwise create new chat
      let chatId = chatIdArg || currentChatId;
      if (!chatId) {
        const newChatId = await createNewChat();
        if (!newChatId) return;
        chatId = newChatId;
      }

      await API.post(`/chats/${chatId}/messages`, { role, content });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setSelectedPDF('');
  };

  const handleSelectChat = (chatId) => {
    loadChat(chatId);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    setIsUploading(true);
    toast.loading('Uploading PDF...');

    try {
      await API.post('/pdfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.dismiss();
      toast.success('PDF uploaded successfully!');
      fetchPDFs(); // Refresh the PDF list
    } catch (error) {
      toast.dismiss();
      toast.error('Error uploading PDF. Please try again.');
      console.error('Error uploading PDF:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    // Save user message to chat
    // Ensure a chat exists before proceeding so both user and AI messages use the same chat id
    let chatId = currentChatId;
    if (!chatId) {
      const created = await createNewChat();
      if (!created) {
        setLoading(false);
        return;
      }
      chatId = created;
    }

    // Pass the resolved chatId explicitly to avoid duplicate creation if state hasn't updated
    await saveMessageToChat('user', userInput, chatId);

    try {
      let response;
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        timestamp: new Date()
      };

      // Check if a PDF is selected
      if (selectedPDF) {
        // Check if it's a summarization request
        const isSummarizationRequest = userInput.toLowerCase().includes('summarize') || 
                                        userInput.toLowerCase().includes('summary') ||
                                        userInput.toLowerCase().includes('résume') ||
                                        userInput.toLowerCase().includes('résumé');
        
        if (isSummarizationRequest) {
          // Use summarize endpoint
          response = await API.post('/ai/summarize-pdf', {
            pdfId: selectedPDF,
            language: selectedLanguage
          });
          aiMessage.text = response.data.summary;
        } else {
          // Use PDF query endpoint for any other question about the PDF
          response = await API.post('/ai/pdf-query', {
            question: userInput,
            pdfId: selectedPDF,
            language: selectedLanguage
          });
          aiMessage.text = response.data.response;
        }
      } else {
        // No PDF selected, use general ask endpoint
        response = await API.post('/ai/ask', {
          question: userInput,
          language: selectedLanguage
        });
        aiMessage.text = response.data.response;
      }

      setMessages(prev => [...prev, aiMessage]);

      // Save AI response to same chat (use the explicit chatId)
      await saveMessageToChat('ai', aiMessage.text, chatId);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePDFQuery = async (pdfId) => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: `Based on PDF: ${input}`,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await API.post('/ai/pdf-query', {
        question: input,
        pdfId,
        language: selectedLanguage
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, there was an error processing your PDF query. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
      setSelectedPDF('');
    }
  };

  const quickActions = [
    "Explain this concept in simple terms",
    "Translate to Arabic",
    "Summarize this chapter",
    "Generate 5 exercises based on this topic"
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-black p-2 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">Ask AI Assistant</h1>
              <p className="text-xs text-gray-500">Get instant answers in your preferred language</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-auto">
            <div className="flex items-center space-x-2 bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
              <Languages className="w-4 h-4 text-primary" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm font-medium focus:outline-none bg-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {pdfs.length > 0 && (
              <div className="flex items-center space-x-2 bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
                <FileText className="w-4 h-4 text-primary" />
                <select
                  value={selectedPDF}
                  onChange={(e) => setSelectedPDF(e.target.value)}
                  className="text-sm font-medium focus:outline-none bg-transparent max-w-xs"
                >
                  <option value="">Select PDF</option>
                  {pdfs.map(pdf => (
                    <option key={pdf._id} value={pdf._id}>
                      {pdf.originalName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-gray-200 mb-4">
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-sm font-semibold text-gray-700">AI-Powered Learning</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Taalim AI!</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Ask me anything about your studies, upload a PDF, or try one of these quick actions.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setInput(action)}
                  className="group p-4 text-left bg-white hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-200 transition-all duration-300 hover:shadow-lg"
                >
                  <span className="text-sm text-gray-700 group-hover:text-black font-medium">{action}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl px-5 py-4 ${
                message.sender === 'user'
                  ? 'bg-black text-white shadow-lg'
                  : message.error
                  ? 'bg-red-50 text-red-900 border-2 border-red-200'
                  : 'bg-white border-2 border-gray-200 shadow-lg'
              }`}
            >
              <div className="flex items-start space-x-3">
                {message.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="prose prose-sm max-w-none flex-1">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <pre className={`bg-gray-100 p-3 rounded-lg mb-2 overflow-x-auto ${className}`} {...props}>
                            <code className={className}>{children}</code>
                          </pre>
                        ) : (
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
                        );
                      }
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
                <div className="bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 max-w-3xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your studies, concepts, or upload a PDF..."
              className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all bg-white shadow-sm"
              disabled={loading || isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={loading || isUploading}
              className="px-4 py-3.5 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
              title="Upload PDF"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={loading || isUploading || !input.trim()}
              className="px-6 py-3.5 bg-black text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {selectedPDF && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-gray-100 p-3 rounded-xl border border-gray-200/50"
            >
              <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-black" />
                  <span className="text-sm font-medium text-gray-700">
                    Asking about: {pdfs.find(pdf => pdf._id === selectedPDF)?.originalName}
                  </span>
              </div>
              <button
                type="button"
                onClick={() => handlePDFQuery(selectedPDF)}
                  className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Ask PDF
              </button>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AskAI;