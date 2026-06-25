import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, Paperclip, Mic, ChevronLeft, User, Shield, 
  Bell, Edit, FileText, MessageCircle, Plane, Coffee, 
  Calendar, Settings, Moon, ChevronRight, Loader2, Trash2,
  Star, Lock, X, Info, Sparkles, ChevronDown, Plus, Search, Globe, Grid, Brain, Zap, Bot, Video, AlertTriangle, GraduationCap, Palette, CreditCard, ShieldCheck, Users, Baby, Copy, ThumbsUp, ThumbsDown, Check, Key, Code, Music, MicVocal, Flame, Lightbulb, Workflow, Pencil, Languages, TrendingUp, Scan, Database, Download, Maximize, Minimize
} from 'lucide-react';

// --- FUNDO ANIMADO (Agora recebe a prop isDarkMode para se adaptar) ---
const CodeBlock = ({ language, codeContent, children, className, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e1e] shadow-md group">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] text-gray-300 text-xs font-mono select-none">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {isCopied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="!bg-transparent !p-0 !m-0 !mb-0 text-sm font-mono text-gray-100">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

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
    try {
      const savedTheme = localStorage.getItem('isDarkMode');
      return savedTheme !== null ? JSON.parse(savedTheme) : true;
    } catch(e) {
      return true;
    }
  });
  
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showIAPopup, setShowIAPopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [isIAPopupExpanded, setIsIAPopupExpanded] = useState(false);
  const [unavailablePopup, setUnavailablePopup] = useState(null);
  const [showModelPopup, setShowModelPopup] = useState(false);
  const [showLockedModelPopup, setShowLockedModelPopup] = useState(false);
  const [showPlusPopup, setShowPlusPopup] = useState(false);
  const [showLevelPopup, setShowLevelPopup] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5.5');
  
  const initialMessages = [
    { id: 1, role: 'model', text: 'Olá! Sou seu assistente de IA. Como posso te ajudar hoje?' }
  ];
  
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('chatSessions');
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  });
  
  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('activeSessionId');
      return saved ? JSON.parse(saved) : Date.now();
    } catch(e) {
      return Date.now();
    }
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [messages, setMessages] = useState(() => {
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      const savedActiveId = localStorage.getItem('activeSessionId');
      if (savedSessions && savedActiveId) {
        const parsedSessions = JSON.parse(savedSessions);
        const parsedActiveId = JSON.parse(savedActiveId);
        const session = parsedSessions.find((s: any) => s.id === parsedActiveId);
        if (session) return session.messages;
      }
    } catch (e) {
      console.error("Failed to parse stored sessions");
    }
    return initialMessages;
  });
  
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({});
  const [logoRotation, setLogoRotation] = useState(0);
  const [messagesSentToday, setMessagesSentToday] = useState(0);

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('orion_daily_usage');
      if (storedData) {
        const { date, count } = JSON.parse(storedData);
        if (date === today) {
          setMessagesSentToday(count);
        } else {
          setMessagesSentToday(0);
          localStorage.setItem('orion_daily_usage', JSON.stringify({ date: today, count: 0 }));
        }
      } else {
        localStorage.setItem('orion_daily_usage', JSON.stringify({ date: today, count: 0 }));
      }
    } catch (e) {
      console.error("Failed to parse daily usage");
    }
  }, []);

  const incrementMessageCount = () => {
    const today = new Date().toDateString();
    const newCount = messagesSentToday + 1;
    setMessagesSentToday(newCount);
    localStorage.setItem('orion_daily_usage', JSON.stringify({ date: today, count: newCount }));
  };

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
  const glassPanel = `backdrop-blur-[24px] border transition-colors duration-300 ${isDarkMode ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]' : 'bg-white/60 border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]'}`;
  
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

  const closeAllPopups = () => {
    setShowIAPopup(false);
    setShowInfoPopup(false);
    setShowModelPopup(false);
    setShowLockedModelPopup(false);
    setShowPlusPopup(false);
    setShowLevelPopup(false);
    setShowSensitiveData(false);
  };

  const handleTogglePopup = (popupName) => {
    switch (popupName) {
      case 'plus': {
        const nextPlus = !(showPlusPopup || showLevelPopup);
        closeAllPopups();
        if (nextPlus) setShowPlusPopup(true);
        break;
      }
      case 'model': {
        const nextModel = !showModelPopup;
        closeAllPopups();
        if (nextModel) setShowModelPopup(true);
        break;
      }
      case 'ia': {
        const nextIA = !showIAPopup;
        closeAllPopups();
        if (nextIA) setShowIAPopup(true);
        setIsIAPopupExpanded(false);
        break;
      }
      case 'info': {
        const nextInfo = !showInfoPopup;
        closeAllPopups();
        if (nextInfo) setShowInfoPopup(true);
        break;
      }
      case 'sensitive': {
        const nextSens = !showSensitiveData;
        closeAllPopups();
        if (nextSens) setShowSensitiveData(true);
        break;
      }
    }
  };

  // Função de alternar tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    if (messagesSentToday >= 100) {
      const limitMessage = { id: Date.now(), role: 'model', text: 'Você atingiu o limite diário de 100 mensagens. Volte amanhã para continuar conversando!' };
      setMessages([...messages, { id: Date.now() - 1, role: 'user', text: inputText.trim() }, limitMessage]);
      setInputText('');
      if (textareaRef.current) textareaRef.current.style.height = '28px';
      return;
    }

    const userMessageText = inputText.trim();
    const newUserMessage = { id: Date.now(), role: 'user', text: userMessageText };
    
    incrementMessageCount();

    const isInitialOnly = messages.length === 1 && messages[0].text === initialMessages[0].text;
    const currentMessages = isInitialOnly ? [] : messages;
    
    const updatedMessages = [...currentMessages, newUserMessage];
    setMessages(updatedMessages);
    setInputText('');
    
    // Reset textarea height right away
    if (textareaRef.current) {
      textareaRef.current.style.height = '28px';
    }
    
    setIsLoading(true);

    try {
      const chatHistory = updatedMessages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatHistory,
          model: selectedModel
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let serverError = errData.error || `Erro na requisição: ${res.status}`;
        
        if (typeof serverError === 'object') {
           serverError = JSON.stringify(serverError);
        }
        
        let errorMessage = serverError;
        
        if (typeof serverError === 'string' && serverError.includes('{"error":')) {
           try {
              const parsed = JSON.parse(serverError);
              if (parsed.error && parsed.error.code) {
                 const code = parsed.error.code;
                 if (code === 401) {
                    errorMessage = "Erro de autenticação: A chave de API fornecida é inválida. Verifique suas configurações e certifique-se de que a chave está correta.";
                 } else if (code === 429) {
                    errorMessage = "Limite excedido: Você atingiu o limite de requisições ou tokens da sua chave de API. Aguarde um pouco ou atualize seu plano.";
                 } else if (code === 402) {
                    errorMessage = "Saldo insuficiente: Você não possui créditos suficientes para utilizar este modelo de IA.";
                 } else if (code >= 500) {
                    errorMessage = "Erro no servidor da IA: O provedor de inteligência artificial está passando por instabilidades. Tente novamente mais tarde.";
                 } else {
                    errorMessage = parsed.error.message || errorMessage;
                 }
              }
           } catch(e) {}
        }
        
        if (errorMessage === serverError) {
            if (res.status === 401 || serverError.includes("401") || serverError.includes("Authentication") || serverError.includes("invalid key") || serverError.includes("Invalid API Key")) {
                 errorMessage = "Erro de autenticação: A chave de API fornecida é inválida. Verifique suas configurações e certifique-se de que a chave está correta.";
            } else if (res.status === 429 || serverError.includes("429") || serverError.includes("rate limit") || serverError.includes("limit") || serverError.includes("quota")) {
                 errorMessage = "Limite excedido: Você atingiu o limite de requisições ou tokens da sua chave de API. Aguarde um pouco ou atualize seu plano.";
            } else if (res.status === 402 || serverError.includes("402") || serverError.includes("insufficient_quota") || serverError.includes("credit")) {
                 errorMessage = "Saldo insuficiente: Você não possui créditos suficientes para utilizar este modelo de IA.";
            }
        }
        
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const responseText = data.choices?.[0]?.message?.content || "Resposta da API vazia";
      
      setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: responseText }]);

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: `**Erro:** ${errorMessage}` }]);
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
    if (currentView === 'menu') setLogoRotation(prev => prev + 720);
    setCurrentView('chat');
  };

  const loadSession = (id) => {
    const session = chatSessions.find(s => s.id === id);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages);
      if (currentView === 'menu') setLogoRotation(prev => prev + 720);
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
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: '56px', opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className={`w-full rounded-full flex items-center justify-between px-4 shrink-0 z-20 relative overflow-hidden ${glassPanel}`}
          >
            <button onClick={() => setCurrentView('menu')} className={`p-1.5 ${textSec} hover:${textMain} transition-colors shrink-0 cursor-pointer`}>
              <Menu size={28} />
            </button>
            <div className="flex items-end justify-end">
              <motion.img 
                initial={{ rotate: logoRotation - 720 }}
                src="https://iili.io/CuDewTg.png" 
                alt="Logo" 
                className="h-[28px] object-contain mr-2 cursor-pointer"
                animate={{ rotate: logoRotation }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                onClick={() => setLogoRotation(prev => prev + 720)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área de Mensagens */}
      <div ref={messagesContainerRef} className={`flex-1 w-full rounded-[32px] p-3 sm:p-4 flex flex-col gap-6 overflow-y-auto mb-6 custom-scrollbar z-10 relative ${glassPanel}`}>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end pl-2 sm:pl-4' : 'justify-start pr-2 sm:pr-4'}`}>
            
            {msg.role === 'model' ? (
               <div className={`flex-1 min-w-0 pr-0 group flex flex-col`}>
                  <div className={`w-full ${isDarkMode ? 'text-white/90' : 'text-gray-800'} text-[16px] leading-relaxed markdown-body`}>
                    <Markdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          if (!inline && match) {
                            return (
                              <CodeBlock
                                language={match[1]}
                                codeContent={String(children).replace(/\n$/, '')}
                                className={className}
                                {...props}
                              >
                                {children}
                              </CodeBlock>
                            );
                          }
                          return <code className={className} {...props}>{children}</code>;
                        },
                        pre({ children }) {
                          // Se o filho for o nosso CodeBlock, não envelopamos em pre extra
                          return <div className="not-prose my-6">{children}</div>;
                        }
                      }}
                    >
                      {msg.text}
                    </Markdown>
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
              <div className={`px-5 py-3.5 rounded-3xl rounded-tr-sm text-[16px] leading-relaxed shadow-lg whitespace-pre-wrap break-words break-all border max-w-full ${isDarkMode ? 'bg-gradient-to-br from-red-900/60 to-red-800/40 border-red-500/30 text-white/95' : 'bg-gradient-to-br from-red-100 to-red-50 border-red-200 text-gray-900'}`}>
                {msg.text}
              </div>
            )}

          </div>
        ))}

        {/* Indicador de "Digitando..." */}
        {isLoading && (
          <div className={`flex justify-start gap-4 animate-pulse pr-2 sm:pr-4`}>
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
      <div 
        className={`w-full min-h-[56px] rounded-[28px] grid p-1.5 shrink-0 z-20 relative ${glassPanel}`}
        style={{
          gridTemplateColumns: 'max-content minmax(0, 1fr) max-content',
          gridTemplateAreas: inputText 
            ? '"textarea textarea textarea" "plus space right"'
            : '"plus textarea right"',
          alignItems: inputText ? 'end' : 'center',
          rowGap: inputText ? '4px' : '0px'
        }}
      >
        <div style={{ gridArea: 'plus' }} className="relative flex items-center justify-center shrink-0 h-[40px] px-1">
          {unavailablePopup === 'upload' && (
              <div className={`absolute bottom-[calc(100%+8px)] left-0 min-w-max px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível!
              </div>
            )}
            <button 
              onClick={() => handleTogglePopup('plus')}
              className={`flex items-center justify-center w-9 h-9 rounded-full ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:text-red-400 ${showPlusPopup || showLevelPopup ? (isDarkMode ? 'bg-white/10' : 'bg-gray-100') : ''} transition-colors cursor-pointer`}
            >
            <Plus size={22} className={`transition-transform duration-300 ${showPlusPopup || showLevelPopup ? 'rotate-45' : ''}`} />
          </button>

          {(showPlusPopup || showLevelPopup) && (
             <div className={`absolute bottom-[calc(100%+12px)] left-0 w-[240px] p-2 rounded-2xl shadow-xl border flex flex-col gap-1 z-50 overflow-y-auto max-h-[300px] custom-scrollbar transition-all duration-300 ${isDarkMode ? 'bg-[#2a2a2a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
               
               {showPlusPopup && !showLevelPopup && (
                 <>
                   <div 
                     onClick={() => { setShowPlusPopup(false); setShowLevelPopup(true); }}
                     className={`flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg text-[13px] font-bold tracking-wide cursor-pointer transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                   >
                     <span>Escolher Inteligência</span>
                     <ChevronRight size={14} className="shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setIsExpanded(!isExpanded); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     {isExpanded ? <Minimize size={18} className="shrink-0" /> : <Maximize size={18} className="shrink-0" />}
                     <span className="flex-1 text-left">{isExpanded ? 'Fechar Expansão' : 'Expandir Tela'}</span>
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Paperclip size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Subir arquivo</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Globe size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Buscar na web</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Search size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Pesquisa profunda</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Grid size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Aplicativos</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Video size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Interpretar vídeo</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Flame size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Modo +18</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <GraduationCap size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Aprendizado</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Code size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Programação</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Workflow size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Gerar automação</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Bot size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Criar agentes</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Pencil size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Clonar Escrita</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Languages size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Tradutor Universal</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <TrendingUp size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Relatórios Financeiros</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Scan size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Escanear Web</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Database size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Pegar dados privados</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>

                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowPlusPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Download size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Download Pago</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>
                 </>
               )}
               
               {showLevelPopup && (
                 <>
                   <div className="flex items-center gap-2 px-2 py-1 mb-1">
                     <button onClick={() => { setShowLevelPopup(false); setShowPlusPopup(true); }} className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} cursor-pointer transition-colors`}>
                        <ChevronLeft size={16} className="shrink-0" />
                     </button>
                     <span className={`text-[13px] font-bold tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Nível de Inteligência</span>
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowLevelPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Brain size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Raciocínio</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowLevelPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Lightbulb size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Interpretativo</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
                   </div>
                   
                   <div 
                     onClick={() => { setUnavailablePopup('upload'); setTimeout(() => setUnavailablePopup(null), 2500); setShowLevelPopup(false); }}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed opacity-60 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                   >
                     <Bot size={18} className="shrink-0" />
                     <span className="flex-1 text-left">Agêntico</span>
                     <Lock size={14} className="opacity-50 shrink-0" />
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
            e.target.style.height = '28px';
            e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 28), 150)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
              setTimeout(() => {
                if (textareaRef.current) {
                  textareaRef.current.style.height = '28px';
                }
              }, 10);
            }
          }}
          disabled={isLoading}
          className={`w-full text-left bg-transparent border-none ${textMain} focus:outline-none focus:ring-0 ${isDarkMode ? 'placeholder-white/40' : 'placeholder-gray-400'} text-[16px] px-2 py-0 resize-none leading-normal custom-scrollbar ${inputText ? 'mt-1 self-start' : 'self-center truncate'}`}
          style={{ gridArea: 'textarea', height: '28px', minHeight: '28px' }}
        />

        <div style={{ gridArea: 'right' }} className="flex items-center justify-end shrink-0 gap-2 h-[40px] px-1">
          {!inputText && (
            <div className="relative flex items-center justify-center shrink-0">
              {showModelPopup && (
                  <div className={`absolute bottom-[calc(100%+12px)] right-0 w-[180px] p-2 rounded-2xl shadow-xl border flex flex-col gap-1 overflow-y-auto max-h-[300px] ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} z-50 transition-all duration-300`}>
                    {[
                      { id: 'fictitious/agent-designer', name: 'Agente Designer', locked: true },
                      { id: 'fictitious/agent-instagram', name: 'Agente Instagram', locked: true },
                      { id: 'fictitious/agent-ng', name: 'Agente NG', locked: true },
                      { id: 'fictitious/agent-tiktok', name: 'Agente Tik Tok', locked: true },
                      { id: 'fictitious/agent-youtube', name: 'Agente YouTube', locked: true },
                      { id: 'fictitious/fable-5', name: 'Fable 5', locked: true },
                      { id: 'anthropic/claude-opus-4.7', name: 'Claude Opus 4.7' },
                      { id: 'anthropic/claude-opus-4.8', name: 'Claude Opus 4.8' },
                      { id: 'anthropic/claude-opus-4.8-fast', name: 'Claude Opus 4.8 Flash' },
                      { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6' },
                      { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
                      { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
                      { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro' },
                      { id: 'google/gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
                      { id: 'zhipu/glm-5.1', name: 'GLM 5.1' },
                      { id: 'openai/gpt-5.5', name: 'GPT-5.5' },
                      { id: 'openai/gpt-5.5-pro', name: 'GPT-5.5 Pro' },
                      { id: 'x-ai/grok-4.3', name: 'Grok 4.3' },
                      { id: 'moonshot/kimi-k2.6', name: 'Kimi K2.6' },
                      { id: 'mimo/mimo-v2.5-pro', name: 'MiMo-V2.5-Pro' },
                      { id: 'minimax/minimax-m3', name: 'MiniMax M3' },
                      { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 3 Ultra' },
                      { id: 'qwen/qwen3.6-flash', name: 'Qwen 3.6 Flash' },
                      { id: 'qwen/qwen3.7-max', name: 'Qwen 3.7 Max' },
                      { id: 'alibaba/wan-2.7', name: 'Wan 2.7' },
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
                          } else {
                            setShowModelPopup(false);
                            setShowLockedModelPopup(true);
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
                {showLockedModelPopup && (
                  <div className={`absolute bottom-[calc(100%+12px)] right-0 w-[240px] p-4 rounded-2xl shadow-xl border flex flex-col gap-3 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} z-50 transition-all duration-300`}>
                    <p className="text-[13px] text-left font-medium opacity-90 leading-relaxed text-wrap">
                      Deseja desbloquear o acesso a todos os modelos exclusivos? Entre em contato com a equipe de desenvolvimento para liberar seu acesso.
                    </p>
                    <a 
                      href="https://wa.me/5587981126323" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`block w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-colors ${redGlowButton}`}
                      onClick={() => setShowLockedModelPopup(false)}
                    >
                      Falar com Erick
                    </a>
                  </div>
                )}
                <button 
                  onClick={() => handleTogglePopup('model')}
                  className={`flex items-center h-[32px] gap-1 px-3 rounded-full border ${isDarkMode ? 'border-white/20 text-white/80' : 'border-gray-300 text-gray-700'} hover:border-red-400 hover:text-red-500 transition-all cursor-pointer text-[12px] font-bold tracking-wide shadow-sm max-w-[130px]`}
                >
                  <span className="truncate">
                    {{
                      'openai/gpt-5.5': 'GPT-5.5',
                      'anthropic/claude-opus-4.7': 'Claude Opus 4.7',
                      'anthropic/claude-sonnet-4.6': 'Claude Sonnet 4.6',
                      'qwen/qwen3.6-flash': 'Qwen 3.6 Flash',
                      'google/gemini-3.1-pro-preview': 'Gemini 3.1 Pro',
                      'qwen/qwen3.7-max': 'Qwen 3.7 Max',
                      'google/gemini-3.5-flash': 'Gemini 3.5 Flash',
                      'x-ai/grok-4.3': 'Grok 4.3',
                      'openai/gpt-5.5-pro': 'GPT-5.5 Pro',
                      'fictitious/agent-designer': 'Agente Designer',
                      'fictitious/agent-instagram': 'Agente Instagram',
                      'fictitious/agent-ng': 'Agente NG',
                      'fictitious/agent-tiktok': 'Agente Tik Tok',
                      'fictitious/agent-youtube': 'Agente YouTube',
                      'fictitious/fable-5': 'Fable 5',
                      'zhipu/glm-5.1': 'GLM 5.1',
                      'deepseek/deepseek-v4-pro': 'DeepSeek V4 Pro',
                      'deepseek/deepseek-v4-flash': 'DeepSeek V4 Flash',
                      'mimo/mimo-v2.5-pro': 'MiMo-V2.5-Pro',
                      'moonshot/kimi-k2.6': 'Kimi K2.6',
                      'alibaba/wan-2.7': 'Wan 2.7',
                      'anthropic/claude-opus-4.8': 'Claude Opus 4.8',
                      'anthropic/claude-opus-4.8-fast': 'Claude Opus 4.8 Flash',
                      'minimax/minimax-m3': 'MiniMax M3',
                      'nvidia/nemotron-3-ultra-550b-a55b:free': 'Nemotron 3 Ultra'
                    }[selectedModel] || 'Modelo'}
                  </span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${showModelPopup ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                !inputText.trim() || isLoading
                  ? (isDarkMode ? 'bg-white/10 text-white/30' : 'bg-gray-100 text-gray-400')
                  : (isDarkMode ? 'bg-white text-black hover:bg-gray-200 shadow-md' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md')
              }`}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 5.414V21a1 1 0 0 1-2 0V5.414L6.707 9.707a1 1 0 0 1-1.414-1.414l6-6a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1-1.414 1.414L13 5.414z" />
                </svg>
              )}
            </button>
        </div>
      </div>
    </motion.div>
  );

  // --- Renderização da Visão do Menu Lateral ---
  const renderMenuView = () => (
    <motion.div 
      key="menu-overlay"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute inset-0 z-[100] flex"
    >
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={() => { setLogoRotation(prev => prev + 720); setCurrentView('chat'); }}
      ></div>

      <motion.div
        key="menu-sidebar"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-[85%] max-w-[320px] h-full flex flex-col shadow-2xl backdrop-blur-md border-r transition-colors duration-300 ${isDarkMode ? 'bg-black/10 border-white/10' : 'bg-white/20 border-white/60'}`}
      >
        <div className="flex-1 overflow-y-auto w-full p-6 pb-[140px] custom-scrollbar flex flex-col gap-2 relative z-10">
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-[14px] font-bold tracking-wider drop-shadow-sm`}>SEUS CHATS</h3>
            <button onClick={() => { setLogoRotation(prev => prev + 720); setCurrentView('chat'); }} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
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

        <div className={`absolute z-20 bottom-[80px] left-0 w-full px-5 py-3 border-t ${isDarkMode ? 'border-white/5 bg-black/40 text-white' : 'border-gray-200 bg-white/60 text-gray-900'} backdrop-blur-md`}>
          <div className="flex justify-between items-center mb-1.5 text-[12px] font-medium opacity-80">
            <span>Mensagens Hoje</span>
            <span>{messagesSentToday} / 100</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}>
            <div 
              className={`h-full transition-all duration-500 ${messagesSentToday >= 100 ? 'bg-red-500' : (isDarkMode ? 'bg-white' : 'bg-gray-800')}`} 
              style={{ width: `${Math.min((messagesSentToday / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className={`absolute z-20 bottom-0 left-0 w-full h-[80px] border-t flex items-center justify-center gap-3 px-4 ${isDarkMode ? 'border-white/5 bg-black/10' : 'border-gray-200 bg-white/20'} backdrop-blur-md`}>
            <button 
              onClick={startNewChat} 
              className={`h-[40px] px-4 rounded-full text-[14px] font-medium shrink-0 flex items-center justify-center flex-1 ${redGlowButton}`}
            >
              Chat+
            </button>

            <div className="shrink-0">
              <button 
                onClick={() => handleTogglePopup('ia')} 
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

            <div className="shrink-0">
              <button 
                onClick={() => handleTogglePopup('info')} 
                className={`h-[40px] px-4 flex items-center justify-center rounded-full shrink-0 ${whiteGlowButton} hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors cursor-pointer`}
              >
                <div className="relative flex items-center justify-center">
                  <Info size={22} />
                </div>
              </button>
            </div>

            {/* Popups - positioned relative to the footer */}
            {showIAPopup && (
              <div className={`absolute bottom-full right-4 mb-4 w-[280px] max-w-[85vw] p-4 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} z-50 transition-all duration-300 max-h-[70dvh] overflow-y-auto custom-scrollbar`}>
                <div className="text-[13px] mb-3 leading-relaxed">
                  Este recurso exclusivo ainda não está disponível para todos.
                  {!isIAPopupExpanded && (
                    <span onClick={() => setIsIAPopupExpanded(true)} className="text-red-400 font-semibold ml-1 cursor-pointer hover:underline inline-block">O que é?</span>
                  )}
                </div>
                
                {isIAPopupExpanded && (
                  <div className={`text-[12px] mb-4 space-y-3 ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`}>
                    <p>Trata-se de uma ferramenta avançada de inteligência artificial que permite criar imagens, vídeos, narrações e músicas de forma totalmente personalizada. A ferramenta oferece diversos recursos de configuração, possibilitando ajustar estilos visuais, definir características de voz, personalizar trilhas sonoras e adaptar cada geração às suas necessidades.</p>
                    <p>Para garantir resultados de alta qualidade, a plataforma integra os modelos de IA mais avançados do mercado por meio de suas respectivas APIs.</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Vídeos:</strong> Seedance 2.0, Kling 3.0, Sora, Gemini Omni, Luma Ray 3, Runway Video, MiniMax Video e outros.</li>
                      <li><strong>Imagens:</strong> Nano Banana, GPT Image, Midjourney, Flux, Ideogram, Runway Image, MiniMax Image, Adobe Firefly, Seedream e outros.</li>
                      <li><strong>Narrações:</strong> ElevenLabs V3, MiniMax Audio, Runway Audio, Speechify Studio, Murf AI e outros.</li>
                      <li><strong>Músicas:</strong> Suno, Udio, ElevenLabs Music, Stable Audio, Mubert, Google Lyria 3, MiniMax Music, Tad AI e outros.</li>
                    </ul>
                    <p>Os recursos são disponibilizados por meio de um sistema de créditos, permitindo que você utilize os modelos conforme a sua demanda. Além disso, os custos de utilização são reduzidos, oferecendo valores mais acessíveis do que os praticados nas plataformas originais.</p>
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

            {showInfoPopup && (
              <div className={`absolute bottom-full right-4 mb-4 w-[280px] p-4 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} z-50 transition-all duration-300`}>
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
                  href="https://bolt.new/?adgroup=Brand-Bolt-Core&network=g&device=m&placement=&utm_source=google&utm_medium=cpc&utm_campaign=LATAM-GS-Brand-Bolt&utm_content=Register-Chat-Build-Deploy&utm_term=bolt&hsa_grp=197196418232&hsa_ad=809250884090&hsa_src=g&hsa_tgt=kwd-29603716&hsa_kw=bolt&hsa_mt=e&hsa_cam=23857154390&hsa_acc=1356040017&hsa_net=adwords&hsa_ver=3&gad_source=1&gad_campaignid=23857154390&gbraid=0AAAAA-WCawXlgy2Xn04oPi2V7WyszVD-o&gclid=CjwKCAjw5s_QBhAdEiwADD_gBu9SXlQv-uQOXAlUQHX_8wcZEZzFNcz0bbBcvN1POhrh7BygIef4pRoCC-kQAvD_BwE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block w-full py-2.5 rounded-xl text-center text-[13px] font-semibold transition-colors ${redGlowButton}`}
                >
                  Acessar Bolt.new
                </a>
              </div>
            )}
        </div>
      </motion.div>
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
      className="flex flex-col h-full w-full z-10 relative px-4 py-6 overflow-y-auto custom-scrollbar"
    >
      <div className="flex items-center justify-center w-full mb-6 relative px-2 shrink-0">
        <button onClick={() => setCurrentView('menu')} className={`absolute left-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-gray-800 hover:bg-gray-100 shadow-sm border border-gray-200'}`}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={`${textMain} text-[20px] font-bold tracking-wide drop-shadow-md truncate px-12`}>Configurações</h1>
      </div>

      <div className={`w-full rounded-[28px] flex flex-col p-5 ${glassPanel} mt-2`}>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3 px-2">
            <h2 className={`${textSub} font-semibold text-[13px] uppercase tracking-wider drop-shadow-sm`}>Informações Pessoais</h2>
          </div>
          
          <div className="relative">
            {unavailablePopup === 'perfil' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('perfil'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <User size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Configurações de Perfil</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
          
          <div className="relative">
            {unavailablePopup === 'dados' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('dados'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Shield size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Controle de Dados</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'personalizacao' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('personalizacao'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Palette size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Personalização do aplicativo</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'memorias' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('memorias'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Brain size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Memórias</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'voz' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('voz'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Mic size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Voz do aplicativo</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'controle_pais' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('controle_pais'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Baby size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Controle dos pais</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0`} />
            </div>
          </div>

          <div className={`h-[1px] w-full my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          <div className="relative">
            {unavailablePopup === 'assinar' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div onClick={() => { setUnavailablePopup('assinar'); setTimeout(() => setUnavailablePopup(null), 2500); }} className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <CreditCard size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Assinar a plataforma</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0`} />
            </div>
          </div>
          
          <div className={`h-[1px] w-full my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
          
          <div className="relative flex flex-col">
            <div onClick={() => handleTogglePopup('sensitive')} className="flex items-center justify-between py-2 cursor-pointer transition-opacity hover:opacity-80">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`}>
                  <AlertTriangle size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Dados Sensíveis</span>
              </div>
              <ChevronRight size={18} className={`${textSub} shrink-0 transition-transform duration-200 ${showSensitiveData ? 'rotate-90' : ''}`} />
            </div>
            
            <AnimatePresence>
              {showSensitiveData && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <button onClick={clearAllHistory} className={`w-full py-2 rounded-xl font-medium text-[13px] mt-2 mb-2 shrink-0 transition-all duration-200 flex justify-center items-center gap-2 ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/15 text-white border border-white/5'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                  }`}>
                    Resetar Aplicativo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        <div className={`h-[1px] w-full mb-4 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

        <div className="mb-2">
          <div className="relative">
            {unavailablePopup === 'notificacoes' && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-lg border z-50 whitespace-nowrap transition-all duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                Ainda não disponível
              </div>
            )}
            <div 
              onClick={() => { setUnavailablePopup('notificacoes'); setTimeout(() => setUnavailablePopup(null), 2500); }}
              className="flex items-center justify-between py-2 cursor-not-allowed opacity-40 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  <Bell size={20} />
                </div>
                <span className={`${textSec} text-[15px] font-bold drop-shadow-sm truncate`}>Notificações</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative flex items-center p-1 shrink-0 transition-colors duration-300 ${notificationsEnabled ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : (isDarkMode ? 'bg-white/20' : 'bg-gray-300')} pointer-events-none`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute shadow-md transition-all duration-300 ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-gray-200'}`}>
      <div className={`relative w-full ${isExpanded ? 'max-w-[1000px]' : 'md:max-w-[428px]'} h-[100dvh] md:h-[850px] md:max-h-[90vh] md:rounded-[48px] overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)] md:border-[6px] transition-all duration-500 ${isDarkMode ? 'bg-[#050505] md:border-[#1a1a1a]' : 'bg-[#f8f9fa] md:border-gray-300'}`}>
        
        <BackgroundEffects isDarkMode={isDarkMode} />
        
        <AnimatePresence mode="wait">
          {(currentView === 'chat' || currentView === 'menu') && renderChatView()}
          {currentView === 'settings' && renderSettingsView()}
        </AnimatePresence>

        <AnimatePresence>
          {currentView === 'menu' && renderMenuView()}
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
