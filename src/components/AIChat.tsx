import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Heart, Lightbulb, Activity } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface AIChatProps {
  user: User;
}

const AIChat: React.FC<AIChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // This useEffect handles fetching initial data
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First, fetch conversation history
        const historyResponse = await fetch(`http://localhost/ai_companion_backend/api/conversations.php?user_id=${user.id}`);
        if (!historyResponse.ok) {
          throw new Error('Failed to fetch conversation history.');
        }
        const historyData = await historyResponse.json();

        // If history exists, set it
        if (historyData.length > 0) {
          setMessages(historyData);
        } else {
          // If no history, make a POST request for a welcome message
          const welcomeResponse = await fetch('http://localhost/ai_companion_backend/api/ai_chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              message: 'start_conversation_signal'
            }),
          });
          
          if (!welcomeResponse.ok) {
            throw new Error('Failed to get welcome message.');
          }

          const welcomeResult = await welcomeResponse.json();
          setMessages([
            {
              id: 'welcome-message',
              sender: 'kai',
              content: welcomeResult.message,
              timestamp: new Date().toISOString(),
              type: 'text'
            }
          ]);
        }
      } catch (err) {
        console.error("API call failed:", err);
        setError("Failed to load chat history. Please check your backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [user.id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setError(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost/ai_companion_backend/api/ai_chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          message: userMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from Kai.');
      }
      
      const result = await response.json();
      
      const kaiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'kai',
        content: result.message,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      setMessages(prev => [...prev, kaiResponse]);

    } catch (err) {
      console.error("API call failed:", err);
      setError("Failed to connect to Kai. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };
  
  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Loading conversation...</div>;
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  const quickActions = [
    { label: 'I need breathing help', icon: Activity, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { label: 'Feeling anxious', icon: Heart, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { label: 'Want to journal', icon: Lightbulb, color: 'bg-green-100 text-green-700 border-green-200' },
    { label: 'Having a good day', icon: Heart, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Kai</h2>
            <p className="text-sm text-green-600">Your AI Mental Health Companion • Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-10">
            Start a new conversation with Kai!
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'kai'
                ? 'bg-gradient-to-br from-blue-500 to-green-500'
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              {message.sender === 'kai' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <UserIcon className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              message.sender === 'user' ? 'text-right' : ''
            }`}>
              <div className={`p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.type === 'suggestion'
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.label)}
                className={`px-3 py-2 rounded-full text-xs border transition-colors ${action.color}`}
              >
                <action.icon className="w-3 h-3 inline mr-1" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... Press Enter to send"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Kai is here to support you. For urgent help, contact your counselor or emergency services.
        </p>
      </div>
    </div>
  );
};

export default AIChat;