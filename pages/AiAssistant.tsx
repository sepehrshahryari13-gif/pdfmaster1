import React, { useState, useRef, useEffect } from 'react';
import { FileDrop } from '../components/FileDrop';
import { Button } from '../components/Button';
import { analyzePdf } from '../services/geminiService';
import { Send, Bot, User, FileText, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';

const AiAssistant: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setMessages([{
        id: 'init',
        role: 'model',
        text: `I've loaded **${files[0].name}**. I can summarize it or answer any questions you have about its content.`
      }]);
    }
  };

  const handleClear = () => {
    setFile(null);
    setMessages([]);
    setInput('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !file) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Send chat history for context + new prompt
      // Note: In this simple implementation, we resend the file + context with every request
      // because the standard generateContent doesn't maintain stateful sessions with file attachments easily
      // without using the Caching API or complex ChatSession setup.
      // Sending the file every time (for small files) is a robust stateless approach for a demo.
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await analyzePdf(file, userMsg.text, history);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error analyzing the PDF. Please try again.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick prompt suggestions
  const quickPrompts = [
    "Summarize this document",
    "What are the key takeaways?",
    "Explain the main argument"
  ];

  if (!file) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
           <div className="flex justify-center mb-4">
             <div className="bg-purple-100 p-4 rounded-full text-purple-600">
               <Sparkles size={40} />
             </div>
           </div>
          <h1 className="text-3xl font-bold text-slate-900">AI PDF Assistant</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Upload a PDF to chat with it. Powered by Gemini 2.5 Flash, capable of understanding documents, tables, and complex text.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <FileDrop 
            onFilesSelected={handleFileSelected} 
            multiple={false}
            description="Upload a PDF to start chatting"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg text-red-500">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-sm md:text-base">{file.name}</h2>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
          title="Remove file"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : msg.isError 
                  ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                  : 'bg-slate-100 text-slate-800 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className="shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-slate-500" />
              <span className="text-sm text-slate-500">Analyzing document...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {quickPrompts.map(p => (
              <button 
                key={p} 
                onClick={() => { setInput(p); handleSubmit(); }} // Won't auto submit immediately due to setInput async, but close enough for UX if user clicks send
                className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your PDF..."
            className="flex-1 rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 pr-12 pl-4"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;