import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Heart, Lightbulb, Activity } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface AIChatProps {
  user: User;
}

const AIChat: React.FC<AIChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'kai',
      content: `Hi ${user.name}! I'm Kai, your mental health companion. I'm here to listen, support, and help you on your wellness journey. How are you feeling today?`,
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateKaiResponse = (userMessage: string): ChatMessage => {
    // Simple response generation based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';
    let type: 'text' | 'suggestion' | 'exercise' = 'text';
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('stressed') || lowerMessage.includes('worry')) {
      response = "I hear that you're feeling anxious. That's completely understandable, and it takes courage to acknowledge these feelings. Would you like to try a quick breathing exercise? I can guide you through a 1-minute technique that many find helpful for managing anxiety in the moment.";
      type = 'suggestion';
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
      response = "I'm sorry you're going through a difficult time right now. Your feelings are valid, and it's important that you reached out. Remember, it's okay to not be okay sometimes. What's one small thing that usually brings you a bit of comfort?";
    } else if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      response = "That's wonderful to hear! It's beautiful when we can recognize and appreciate the good moments. What specifically is contributing to these positive feelings today? Celebrating these moments, even small ones, is so important for our mental health.";
    } else if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('sleep')) {
      response = "It sounds like you might be experiencing some fatigue. Rest is so crucial for our mental and physical well-being. Have you been able to maintain a regular sleep schedule lately? Sometimes small adjustments to our evening routine can make a big difference.";
    } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss')) {
      response = "Work-related stress is very common, and it can really impact our overall well-being. It's important to find healthy ways to manage work stress and maintain boundaries. What aspect of work is weighing on you most right now?";
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('grateful')) {
      response = "Your gratitude really warms my heart! Practicing gratitude is one of the most powerful tools for mental wellness. It's amazing how acknowledging the good things, no matter how small, can shift our perspective and mood.";
    } else {
      response = "Thank you for sharing that with me. Your thoughts and feelings matter, and I'm here to listen without judgment. Can you tell me more about what's on your mind? Sometimes just talking through things can help us process and understand our emotions better.";
    }

    return {
      id: Date.now().toString(),
      sender: 'kai',
      content: response,
      timestamp: new Date().toISOString(),
      type
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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

    // Simulate typing delay
    setTimeout(() => {
      const kaiResponse = generateKaiResponse(inputMessage);
      setMessages(prev => [...prev, kaiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'I need breathing help', icon: Activity, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { label: 'Feeling anxious', icon: Heart, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { label: 'Want to journal', icon: Lightbulb, color: 'bg-green-100 text-green-700 border-green-200' },
    { label: 'Having a good day', icon: Heart, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

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
      {messages.length === 1 && (
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