import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, Paperclip, Mic, ChevronLeft, User, Shield, 
  Bell, Edit, FileText, MessageCircle, Plane, Coffee, 
  Calendar, Settings, Moon, ChevronRight, Loader2, Trash2,
  Star, Lock, X, Info, Sparkles, ChevronDown, Plus, Search, Globe, Grid, Brain, Zap, Bot, Video, AlertTriangle, GraduationCap, Palette, CreditCard, ShieldCheck, Users, Baby, Copy, ThumbsUp, ThumbsDown, Check
} from 'lucide-react';

// --- FUNDO ANIMADO (Agora recebe a prop isDarkMode para se adaptar) ---
const BackgroundEffects = ({ isDarkMode }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-[#f0f2f5]'}`}>
    <div className={`absolute top-[-10%] left-[20%] w-[60%] h-[30%] blur-[100px] rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}></div>
    <div className={`absolute top-[20%] left-[-20%] w-[140%] h-[2px] blur-[2px] rotate-[15deg] transition-colors duration-500 ${isDarkMode ? 'bg-red-600/30 shadow-[0_0_30px_10px_rgba(220,38,38,0.4)]' : 'bg-red-400/40 shadow-[0_0_30px_10px_rgba(220,38,38,0.2)]'}`}></div>
    <div className={`absolute top-[60%] left-[-20%] w-[140%] h-[1px] blur-[1px] -rotate-[30deg] transition-colors duration-500 ${isDarkMode ? 'bg-red-500/50 shadow-[0_0_40px_15px_rgba(220,38,38,0.3)]' : 'bg-red-400/50 shadow-[0_0_40px_15px_rgba(220,38,38,0.2)]'}`}></div>
    <div className={`absolute bottom-[10%] right-[-10%] w-[80%] h-[3px] blur-[4px] rotate-[45deg] transition-colors duration-500 ${isDarkMode ? 'bg-red-600/20 shadow-[0_0_50px_20px_rgba(220,38,38,0.5)]' : 'bg-red-500/30 shadow-[0_0_50px_20px_rgba(220,38,38,0.3)]'}`}></div>
    <div className={`absolute top-[40%] left-[30%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-red-900/20 mix-blend-screen' : 'bg-red-400/20 mix-blend-multiply'}`}></div>
  </div>
);

const App = () => {
  const [currentView, setCurrentView] = useState('chat');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NOVO ESTADO: Tema ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showIAPopup, setShowIAPopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [isIAPopupExpanded, setIsIAPopupExpanded] = useState(false);
  const [unavailablePopup, setUnavailablePopup] = useState(null);
  const [showModelPopup, setShowModelPopup] = useState(false);
  const [showPlusPopup, setShowPlusPopup] = useState(false);
  const [showLevelPopup, setShowLevelPopup] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5.5');
  
  const initialMessages = [
    { id: 1, role: 'model', text: 'Olá! Sou seu assistente de IA. Como posso te ajudar hoje?' }
  ];
  
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem('chatSessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem('activeSessionId');
    return saved ? JSON.parse(saved) : Date.now();
  });
  
  const [messages, setMessages] = useState(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    const savedActiveId = localStorage.getItem('activeSessionId');
    if (savedSessions && savedActiveId) {
      const parsedSessions = JSON.parse(savedSessions);
      const parsedActiveId = JSON.parse(savedActiveId);
      const session = parsedSessions.find((s) => s.id === parsedActiveId);
      if (session) return session.messages;
    }
    return initialMessages;
  });
  
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({});

  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem('activeSessionId', JSON.stringify(activeSessionId));
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // --- CLASSES DINÂMICAS BASEADAS NO TEMA ---
  const glassPanel = `backdrop-blur-[24px] border transition-all duration-300 ${isDarkMode ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]' : 'bg-white/60 border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]'}`;
  
  const redGlowButton = `border cursor-pointer transition-all ${isDarkMode 
    ? 'bg-gradient-to-r from-red-950/40 to-red-900/40 border-red-500/70 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:brightness-125' 
    : 'bg-gradient-to-r from-white to-red-50 border-red-200 text-red-700 shadow-[0_4px_15px_rgba(220,38,38,0.15)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.25)]'}`;
    
  const whiteGlowButton = `border cursor-pointer transition-all ${isDarkMode 
    ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:brightness-125' 
    : 'bg-gradient-to-r from-white to-gray-50 border-gray-300 text-gray-800 shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]'}`;
    
  const redTextGlow = isDarkMode ? "text-red-400 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "text-red-600 font-bold";

  // Variáveis para as cores dos textos dinâmicos
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-white/80' : 'text-gray-700';
  const textMuted = isDarkMode ? 'text-white/60' : 'text-gray-500';
  const textSub = isDarkMode ? 'text-white/40' : 'text-gray-400';

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length <= 1) return;

    setChatSessions(prev => {
      const existing = prev.find(s => s.id === activeSessionId);
      const userMsg = messages.find(m => m.role === 'user');
      const title = userMsg 
        ? (userMsg.text.length > 25 ? userMsg.text.substring(0, 25) + '...' : userMsg.text) 
        : 'Novo Chat';

      if (existing) {
        return prev.map(s => s.id === activeSessionId ? { ...s, messages, title, updatedAt: Date.now() } : s);
      } else {
        return [{ id: activeSessionId, title, messages, updatedAt: Date.now() }, ...prev];
      }
    });
  }, [messages, activeSessionId]);

  // Função de alternar tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    const newUserMessage = { id: Date.now(), role: 'user', text: userMessageText };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText('');
    
    // Reset textarea height right away
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
    
    setIsLoading(true);

    try {
      const chatHistory = updatedMessages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          model: selectedModel
        })
      });

      if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);

      const data = await res.json();
      const responseText = data.choices?.[0]?.message?.content || "Resposta da API vazia";
      
      setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: responseText }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: "Ocorreu um erro inesperado." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const startNewChat = () => {
    setActiveSessionId(Date.now());
    setMessages(initialMessages);
    setCurrentView('chat');
  };

  const loadSession = (id) => {
    const session = chatSessions.find(s => s.id === id);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages);
      setCurrentView('chat');
    }
  };

const deleteSession = (e, id) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(s => s.id !== id));
    if (id === activeSessionId) {
      startNewChat();
    }
  };

  const clearAllHistory = () => {
    setChatSessions([]);
    setActiveSessionId(Date.now());
    setMessages(initialMessages);
    localStorage.removeItem('chatSessions');
    localStorage.removeItem('activeSessionId');
    setCurrentView('chat');
  };

  // --- Renderização da Visão do Chat ---
  const renderChatView = () => (
    <motion.div 
      key="chat"
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full w-full z-10 relative px-4 py-6"
    >
      {/* Cabeçalho do Chat */}
      <div className={`w-full h-14 rounded-full flex items-center justify-between px-4 mb-6 shrink-0 z-20 relative ${glassPanel}`}>
        <button onClick={() => setCurrentView('menu')} className={`p-2 ${textSec} hover:${textMain} transition-colors shrink-0 cursor-pointer`}>
          <Menu size={24} />
        </button>
        <div className="flex items-end justify-end">
          <img src="https://i.ibb.co/9FRV6Ys/Picsart-26-05-24-21-38-18-960.png" alt="Logo" className="h-[42px] object-contain mr-2" />
        </div>
      </div>

      {/* Área de Mensagens */}
      <div ref={messagesContainerRef} className={`flex-1 w-full rounded-[32px] p-6 flex flex-col gap-6 overflow-y-auto mb-6 custom-scrollbar z-10 relative ${glassPanel}`}>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end pl-12' : 'justify-start pr-0 gap-3'}`}>
            
            {msg.role === 'model' && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? 'white' : '#374151'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              </div>
            )}
            
            {msg.role === 'model' ? (
               <div className={`flex-1 min-w-0 pr-0 group flex flex-col`}>
                 <div className={`${isDarkMode ? 'text-white/90' : 'text-gray-800'} text-[16px] leading-relaxed markdown-body`}>
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                 </div>
                 
                 <div className="flex items-center gap-1 mt-1 -ml-1.5 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText(msg.text);
                       setCopiedMessageId(msg.id);
                       setTimeout(() => setCopiedMessageId(null), 2000);
                     }} 
                     className={`p-1.5 rounded-md transition-colors cursor-pointer ${isDarkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                     title="Copiar"
                   >
                     {copiedMessageId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                   </button>
                   <button 
                     onClick={() => setMessageFeedback(prev => ({ ...prev, [msg.id]: prev[msg.id] === 'up' ? null : 'up' }))}
                     className={`p-1.5 rounded-md transition-colors cursor-pointer ${isDarkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title="Resposta boa"
                   >
                     <ThumbsUp size={14} className={messageFeedback[msg.id] === 'up' ? (isDarkMode ? 'fill-white text-white' : 'fill-gray-600 text-gray-600') : ''} />
                   </button>
                   <button 
                     onClick={() => setMessageFeedback(prev => ({ ...prev, [msg.id]: prev[msg.id] === 'down' ? null : 'down' }))}
                     className={`p-1.5 rounded-md transition-colors cursor-pointer ${isDarkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title="Resposta ruim"
                   >
                     <ThumbsDown size={14} className={messageFeedback[msg.id] === 'down' ? (isDarkMode ? 'fill-white text-white' : 'fill-gray-600 text-gray-600') : ''} />
                   </button>
                 </div>
               </div>
            ) : (
              <div className={`px-5 py-3.5 rounded-3xl rounded-tr-sm text-[16px] leading-relaxed shadow-lg whitespace-pre-wrap border ${isDarkMode ? 'bg-gradient-to-br from-red-900/60 to-red-800/40 border-red-500/30 text-white/95' : 'bg-gradient-to-br from-red-100 to-red-50 border-red-200 text-gray-900'}`}>
                {msg.text}
              </div>
            )}

          </div>
        ))}

        {/* Indicador de "Digitando..." */}
        {isLoading && (
          <div className="flex justify-start pr-12 gap-4 animate-pulse">
             <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-sm'}`}>
                <Loader2 size={14} className={`${isDarkMode ? 'text-white' : 'text-gray-700'} animate-spin`} />
              </div>
              <div className={`${textMuted} text-[15px] leading-tight mt-1 flex items-center`}>
                 A Inteligência Artificial está pensando...
              </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Área de Input de Texto */}
      <div className={`w-full min-h-[56px] rounded-[28px] flex items-end p-1.5 shrink-0 z-20 relative ${glassPanel}`}>
        <div className="relative flex items-center justify-center shrink-0 h-[44px]">
          {unavailablePopup === 'upload' && (
            <div className={`absolute bottom-[calc(100%+8px)] left-0 min-w-max px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              Ainda não disponível!
            </div>
          )}
          <button 
            onClick={() => { setShowPlusPopup(!showPlusPopup); setShowLevelPopup(false); }}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:text-red-400 ${showPlusPopup || showLevelPopup ? (isDarkMode ? 'bg-white/10' : 'bg-gray-100') : ''} transition-colors cursor-pointer`}
          >
            <Plus size={22} className={`transition-transform duration-300 ${showPlusPopup || showLevelPopup ? 'rotate-45' : ''}`} />
          </button>

          {(showPlusPopup || showLevelPopup) && (
             <div className={`absolute bottom-[calc(100%+12px)] left-0 w-[240px] p-2 rounded-2xl shadow-xl border flex flex-col gap-1 z-50 overflow-y-auto max-h-[300px] custom-scrollbar transition-all duration-300 ${isDarkMode ? 'bg-[#2a2a2a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
               
               {showPlusPopup && !showLevelPopup && (
                 <>
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Paperclip size={18} />
                     <span className="flex-1 text-left">Subir arquivo</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                   
                   <div 
                     onClick={() => { setShowPlusPopup(false); setShowLevelPopup(true); }}
                     className={`flex items-center justify-between px-3 py-1.5 mt-1 mb-1 rounded-lg text-[12px] font-bold tracking-wide cursor-pointer transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                   >
                     <span>SELECIONAR NÍVEL</span>
                     <ChevronRight size={14} />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Globe size={18} />
                     <span className="flex-1 text-left">Buscar na web</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Search size={18} />
                     <span className="flex-1 text-left">Pesquisa profunda</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Grid size={18} />
                     <span className="flex-1 text-left">Aplicativos</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Video size={18} />
                     <span className="flex-1 text-left">Interpretar vídeo</span>
                     <Lock size={14} className="opacity-50" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <AlertTriangle size={18} />
                     <span className="flex-1 text-left">Modo +18</span>
                     <Lock size={14} className="opacity-50" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <GraduationCap size={18} />
                     <span className="flex-1 text-left">Aprendizado</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                 </>
               )}
               
               {showLevelPopup && (
                 <>
                   <div className="flex items-center gap-2 px-2 py-1 mb-1">
                     <button onClick={() => { setShowLevelPopup(false); setShowPlusPopup(true); }} className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} cursor-pointer transition-colors`}>
                        <ChevronLeft size={16} />
                     </button>
                     <span className={`text-[12px] font-bold tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>NÍVEL DE RACIOCÍNIO</span>
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowLevelPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Brain size={18} />
                     <span className="flex-1 text-left">Raciocínio</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowLevelPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <MessageCircle size={18} />
                     <span className="flex-1 text-left">Interpretativo</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowLevelPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Bot size={18} />
                     <span className="flex-1 text-left">Agêntico</span>
                     <Lock size={14} className="opacity-50" />
                   </div>
                 </>
               )}
               
             </div>
          )}
        </div>
        <textarea 
          ref={textareaRef}
          rows={1}
          placeholder="Digite uma mensagem..." 
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            e.target.style.height = '44px';
            e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 44), 150)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
              setTimeout(() => {
                if (textareaRef.current) {
                  textareaRef.current.style.height = '44px';
                }
              }, 10);
            }
          }}
          disabled={isLoading}
          className={`flex-1 min-w-0 w-full bg-transparent border-none ${textMain} focus:outline-none focus:ring-0 ${isDarkMode ? 'placeholder-white/40' : 'placeholder-gray-400'} text-[15px] px-2 py-2.5 resize-none leading-relaxed min-h-[44px] custom-scrollbar ${!inputText ? 'whitespace-nowrap overflow-hidden' : ''}`}
          style={{ height: '44px' }}
        />
        {!inputText && (
          <div className="relative flex items-center justify-center shrink-0 h-[44px] mr-1">
            {showModelPopup && (
              <div className={`absolute bottom-[calc(100%+12px)] right-0 w-[180px] p-2 rounded-2xl shadow-xl border flex flex-col gap-1 overflow-y-auto max-h-[300px] ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} z-50 transition-all duration-300`}>
                {[
                  { id: 'openai/gpt-5.5', name: 'GPT-5.5' },
                  { id: 'anthropic/claude-opus-4.7', name: 'Claude Opus 4.7', locked: true },
                  { id: 'qwen/qwen3.6-flash', name: 'Qwen 3.6 Flash' },
                  { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', locked: true },
                  { id: 'qwen/qwen3.7-max', name: 'Qwen 3.7 Max' },
                  { id: 'google/gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
                  { id: 'x-ai/grok-4.3', name: 'Grok 4.3' },
                  { id: 'openai/gpt-5.5-pro', name: 'GPT-5.5 Pro', locked: true },
                  { id: 'fictitious/agent-ng', name: 'Agent NG', locked: true },
                ].map((modelOpt) => (
                  <div 
                    key={modelOpt.id}
                    className={`px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-between ${
                      modelOpt.locked 
                        ? 'opacity-50 cursor-not-allowed ' + (isDarkMode ? 'bg-white/5' : 'bg-gray-50')
                        : 'cursor-pointer ' + (selectedModel === modelOpt.id ? (isDarkMode ? 'bg-white/10' : 'bg-gray-100') : (isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'))
                    }`}
                    onClick={() => { 
                      if (!modelOpt.locked) {
                        setSelectedModel(modelOpt.id);
                        setShowModelPopup(false); 
                      }
                    }}
                  >
                    <span className="truncate">{modelOpt.name}</span>
                    {modelOpt.locked && (
                      <Lock size={14} className={`shrink-0 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={() => setShowModelPopup(!showModelPopup)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${isDarkMode ? 'border-white/20 text-white/80' : 'border-gray-300 text-gray-700'} hover:border-red-400 hover:text-red-500 transition-all cursor-pointer text-[12px] font-bold tracking-wide shadow-sm max-w-[130px]`}
            >
              <span className="truncate">
                {{
                  'openai/gpt-5.5': 'GPT-5.5',
                  'anthropic/claude-opus-4.7': 'Claude Opus 4.7',
                  'qwen/qwen3.6-flash': 'Qwen 3.6 Flash',
                  'google/gemini-3.1-pro-preview': 'Gemini 3.1 Pro',
                  'qwen/qwen3.7-max': 'Qwen 3.7 Max',
                  'google/gemini-3.5-flash': 'Gemini 3.5 Flash',
                  'x-ai/grok-4.3': 'Grok 4.3',
                  'openai/gpt-5.5-pro': 'GPT-5.5 Pro',
                  'fictitious/agent-ng': 'Agent NG'
                }[selectedModel] || 'Modelo'}
              </span>
              <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${showModelPopup ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
        <button 
          onClick={handleSend}
          disabled={isLoading || !inputText.trim()}
          className={`h-10 mb-[2px] px-4 shrink-0 rounded-full text-[14px] font-semibold ${!isLoading && inputText.trim() ? (isDarkMode ? 'hover:scale-105' : 'hover:scale-105') : 'opacity-70'} ${redGlowButton}`}
        >
          Enviar
        </button>
      </div>
    </motion.div>
  );

 // --- Renderização da Visão do Menu Lateral ---
  const renderMenuView = () => (
    <motion.div 
      key="menu"
      initial={{ opacity: 0, x: '-15%', filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: '-15%', filter: 'blur(10px)' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full w-full z-10 relative px-4 py-12"
    >
      <div className={`w-full h-full rounded-[36px] flex flex-col p-6 overflow-hidden relative ${glassPanel}`}>
        <div className="flex-1 overflow-y-auto w-full pr-2 pb-20 custom-scrollbar flex flex-col gap-2">
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-[14px] font-bold tracking-wider drop-shadow-sm`}>SEUS CHATS</h3>
            <button onClick={() => setCurrentView('chat')} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <X size={18} />
            </button>
          </div>
          
          {chatSessions.length === 0 ? (
            <div className={`${isDarkMode ? 'text-white/30' : 'text-gray-400'} text-[14px] text-left mt-6 px-2`}>
              Seu histórico está vazio. Comece um novo chat!
            </div>
          ) : (
            chatSessions.sort((a, b) => b.updatedAt - a.updatedAt).map(session => (
              <div 
                key={session.id} 
                onClick={() => loadSession(session.id)}
                className={`flex items-center justify-between px-3 transition-all cursor-pointer w-full text-left border ${activeSessionId === session.id ? (isDarkMode ? 'border-white/30 bg-white/[0.03] py-2.5 rounded-xl text-white' : 'border-gray-300 bg-gray-50 py-2.5 rounded-xl text-gray-900') : (isDarkMode ? 'border-transparent py-2.5 hover:bg-white/5 rounded-xl text-white/80' : 'border-transparent py-2.5 hover:bg-gray-100 rounded-xl text-gray-700')}`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <MessageCircle size={18} className={activeSessionId === session.id ? (isDarkMode ? "text-white shrink-0" : "text-gray-900 shrink-0") : "opacity-70 shrink-0"} />
                  <span className={`text-[15px] truncate pr-2 ${activeSessionId === session.id ? 'font-medium' : ''}`}>
                    {session.title}
                  </span>
                </div>
                <button 
                  onClick={(e) => deleteSession(e, session.id)} 
                  className={`p-1.5 shrink-0 rounded-full transition-colors ${activeSessionId === session.id ? (isDarkMode ? 'text-white/50 hover:text-red-400' : 'text-gray-400 hover:text-red-600') : (isDarkMode ? 'text-white/30 hover:text-red-400 hover:bg-white/5' : 'text-gray-400 hover:text-red-600 hover:bg-gray-100')}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className={`absolute z-50 bottom-0 left-0 w-full h-[80px] border-t flex items-center justify-center gap-4 sm:gap-6 px-2 sm:px-6 ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-200 bg-white/40'} backdrop-blur-md`}>
            <button 
              onClick={startNewChat} 
              className={`h-[40px] px-5 sm:px-6 rounded-full text-[14px] sm:text-[15px] font-medium shrink-0 flex items-center justify-center ${redGlowButton}`}
            >
              Novo Chat
            </button>

            <div className="relative shrink-0">
              {showIAPopup && (
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] max-w-[85vw] p-4 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} z-50 transition-all duration-300 max-h-[70dvh] overflow-y-auto custom-scrollbar`}>
                  <div className="text-[13px] mb-3 leading-relaxed">
                    Este recurso exclusivo ainda não está disponível para todos.
                    {!isIAPopupExpanded && (
                      <span onClick={() => setIsIAPopupExpanded(true)} className="text-red-400 font-semibold ml-1 cursor-pointer hover:underline inline-block">O que é?</span>
                    )}
                  </div>
                  
                  {isIAPopupExpanded && (
                    <div className={`text-[12px] mb-4 space-y-2 ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`}>
                      <p>Trata-se de uma ferramenta na qual você pode criar imagens, vídeos, narrações e músicas com inteligência artificial. Nela, é possível personalizar diversos elementos, como o estilo da imagem ou do vídeo, além de ajustar vozes para gerar narrações e trilhas sonoras.</p>
                      <p>Esta plataforma utiliza os modelos mais recentes do mercado:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Vídeos:</strong> Seedence 2.0, Kling 3.0, Sora 2, Gemini Omni e outros.</li>
                        <li><strong>Imagens:</strong> Nano Banana 2, Nano Banana Pro, GPT Image 2, Seedream e outros.</li>
                        <li><strong>Narração:</strong> ElevenLabs, Minimax, Runway e outros.</li>
                        <li><strong>Música:</strong> Suno, Udio, Google Music e outros.</li>
                      </ul>
                      <span onClick={() => setIsIAPopupExpanded(false)} className="text-red-400 font-semibold cursor-pointer hover:underline inline-block mt-1">Mostrar menos</span>
                    </div>
                  )}

                  <a 
                    href="https://wa.me/5587981126323" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`block w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-colors ${redGlowButton}`}
                  >
                    Falar no WhatsApp
                  </a>
                </div>
              )}
              <button 
                onClick={() => {
                  setShowIAPopup(!showIAPopup);
                  if (showIAPopup) setIsIAPopupExpanded(false);
                  if (showInfoPopup) setShowInfoPopup(false);
                }} 
                className={`h-[40px] px-5 sm:px-6 rounded-full text-[14px] sm:text-[15px] font-medium shrink-0 flex items-center justify-center ${whiteGlowButton}`}
              >
                Criar
              </button>
            </div>

            <button 
              onClick={() => setCurrentView('settings')} 
              className={`h-[40px] px-4 rounded-full flex items-center justify-center shrink-0 ${whiteGlowButton} hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors cursor-pointer`}
            >
              <Settings size={22} />
            </button>

            <div className="relative shrink-0">
              {showInfoPopup && (
                <div className={`absolute bottom-full right-0 mb-4 w-[280px] p-4 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} z-50 transition-all duration-300`}>
                  <div className="text-[13px] mb-4 leading-relaxed">
                    <strong className="block mb-2">Desenvolvedores da plataforma:</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Erick</li>
                      <li>Alya</li>
                      <li>Diego</li>
                      <li>Nosso parceiro Bolt.new</li>
                    </ul>
                  </div>
                  <a 
                    href="https://wa.me/5587981126323" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`block w-full py-2.5 rounded-xl text-center text-[13px] font-semibold transition-colors ${redGlowButton}`}
                  >
                    Falar com Erick
                  </a>
                </div>
              )}
              <button 
                onClick={() => {
                  setShowInfoPopup(!showInfoPopup);
                  if (showIAPopup) setShowIAPopup(false);
                }} 
                className={`h-[40px] px-4 flex items-center justify-center rounded-full shrink-0 ${whiteGlowButton} hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors cursor-pointer`}
              >
                <div className="relative flex items-center justify-center">
                  <Info size={22} />
                </div>
              </button>
            </div>
        </div>
      </div>
    </motion.div>
  );

  // --- Renderização da Visão de Configurações ---
  const renderSettingsView = () => (
    <motion.div 
      key="settings"
      initial={{ opacity: 0, y: '15%', filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: '15%', filter: 'blur(10px)' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full w-full z-10 relative px-4 py-8 justify-center"
    >
      <div className="flex items-center justify-center w-full mb-10 relative px-2 shrink-0">
        <button onClick={() => setCurrentView('menu')} className={`absolute left-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-gray-800 hover:bg-gray-100 shadow-sm border border-gray-200'}`}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={`${textMain} text-[22px] font-bold tracking-wide drop-shadow-md truncate px-12`}>Configurações</h1>
      </div>

      <div className={`w-full rounded-[36px] flex flex-col p-6 ${glassPanel}`}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className={`${textSec} font-semibold text-[17px] drop-shadow-sm`}>Informações Pessoais</h2>
            <button onClick={() => setCurrentView('menu')} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <X size={18} />
            </button>
          </div>
          
          <div className="relative">
            {unavailablePopup === 'perfil' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('perfil'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-3 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <User size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Configurações de Perfil</span>
              </div>
              <ChevronRight size={20} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
          
          <div className="relative">
            {unavailablePopup === 'dados' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('dados'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-3 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Shield size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Controle de Dados</span>
              </div>
              <ChevronRight size={20} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'personalizacao' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('personalizacao'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-3 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Palette size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Personalização do aplicativo</span>
              </div>
              <ChevronRight size={20} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'memorias' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('memorias'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-3 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Brain size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Memórias</span>
              </div>
              <ChevronRight size={20} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'voz' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('voz'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-3 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Mic size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Voz do aplicativo</span>
              </div>
              <ChevronRight size={20} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'controle_pais' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('controle_pais'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-3 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Baby size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Controle dos pais</span>
              </div>
              <ChevronRight size={20} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'assinar' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('assinar'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-3 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <CreditCard size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Assinar a plataforma</span>
              </div>
              <ChevronRight size={20} className={`${textSub} shrink-0`} />
            </div>
          </div>
        </div>

        <div className={`h-[1px] w-full mb-6 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

        <div className="mb-8">
          <div className="relative">
            {unavailablePopup === 'notificacoes' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div 
              onClick={() => { setUnavailablePopup('notificacoes'); setTimeout(() => setUnavailablePopup(null), 2500); }}
              className="flex items-center justify-between cursor-not-allowed opacity-40 transition-opacity"
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Bell size={24} />
                </div>
                <span className={`${textSec} text-[17px] font-bold drop-shadow-sm truncate`}>Notificações</span>
              </div>
              <div className={`w-14 h-8 rounded-full relative flex items-center p-1 shrink-0 transition-colors duration-300 ${notificationsEnabled ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : (isDarkMode ? 'bg-white/20' : 'bg-gray-300')} pointer-events-none`}>
                <div className={`w-6 h-6 rounded-full bg-white absolute shadow-md transition-all duration-300 ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={clearAllHistory} className={`w-full py-4 rounded-2xl font-semibold text-[17px] mt-4 shrink-0 ${redGlowButton}`}>
          Apagar Tudo
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-gray-200'}`}>
      <div className={`relative w-full max-w-[428px] h-[100dvh] md:h-[850px] md:max-h-[90vh] md:rounded-[48px] overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)] md:border-[6px] transition-colors duration-500 ${isDarkMode ? 'bg-[#050505] md:border-[#1a1a1a]' : 'bg-[#f8f9fa] md:border-gray-300'}`}>
        
        <BackgroundEffects isDarkMode={isDarkMode} />
        
        <AnimatePresence mode="wait">
          {currentView === 'chat' && renderChatView()}
          {currentView === 'menu' && renderMenuView()}
          {currentView === 'settings' && renderSettingsView()}
        </AnimatePresence>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default App;
