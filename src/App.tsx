/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { getAmealiaResponse } from './services/gemini';
import { ChefHat, Send, User, Sparkles, Utensils, Clock, Heart, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hi! I'm Amealia, your AI meal assistant. Tell me what ingredients you have, how much time you've got, and how you're feeling today, and I'll find the perfect recipe for you!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await getAmealiaResponse(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't think of a recipe right now. Could you try telling me more about what you have?" }]);
    } catch (error) {
      console.error("Amealia Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Oh no, I had a little kitchen mishap! Could you try saying that again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#3C322B] font-sans selection:bg-[#F5E6D3]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#E8DED1] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white shadow-sm">
            <ChefHat size={22} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight">Amealia</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#8C7E6D] font-medium">AI Meal Assistant</p>
          </div>
        </div>
        <div className="flex gap-4 text-[#8C7E6D]">
          <Utensils size={18} className="opacity-60" />
          <Clock size={18} className="opacity-60" />
          <Heart size={18} className="opacity-60" />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div 
          ref={scrollRef}
          className="space-y-8 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-hide"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-[#E8DED1] text-[#8C7E6D]' : 'bg-[#5A5A40] text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                  </div>
                  
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#E8DED1] text-[#3C322B] rounded-tr-none' 
                      : 'bg-white border border-[#E8DED1] rounded-tl-none'
                  }`}>
                    <div className="prose prose-stone prose-sm max-w-none prose-headings:font-serif prose-headings:mb-2 prose-p:leading-relaxed prose-li:my-0">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center text-[#8C7E6D]">
                <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <span className="text-xs italic font-serif">Amealia is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white border border-[#E8DED1] rounded-full shadow-lg flex items-center px-2 py-2 focus-within:border-[#5A5A40] transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What's in your fridge? How are you feeling?"
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm placeholder:text-[#8C7E6D]/50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-[#5A5A40] text-white rounded-full flex items-center justify-center hover:bg-[#4A4A35] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-[#8C7E6D] font-medium uppercase tracking-widest opacity-60">
            Amealia suggests practical, home-cooked meals
          </p>
        </div>
      </div>
    </div>
  );
}
