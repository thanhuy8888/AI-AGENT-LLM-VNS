
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BookOpen, Sparkles, Leaf, Sprout, ShieldCheck, Zap, Info, Menu } from 'lucide-react';
import { geminiService } from './services/geminiService';
import { extractTextFromFile } from './services/fileProcessor';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { Message, Agent, AppStatus, DepartmentType, AgentDocument } from './types';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'initial',
      name: 'Văn phòng Tập đoàn',
      type: 'GENERAL',
      documents: [],
      messages: [],
      suggestions: []
    }
  ]);
  const [activeAgentId, setActiveAgentId] = useState<string>('initial');
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAgent = agents.find(a => a.id === activeAgentId)!;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeAgent.messages, isTyping]);

  const onAddAgent = (name: string, type: DepartmentType) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name,
      type,
      documents: [],
      messages: [],
      suggestions: []
    };
    setAgents(prev => [...prev, newAgent]);
    setActiveAgentId(newAgent.id);
  };

  const onDeleteAgent = (id: string) => {
    if (agents.length <= 1) return;
    setAgents(prev => prev.filter(a => a.id !== id));
    if (activeAgentId === id) setActiveAgentId(agents[0].id);
  };

  const onFilesSelect = async (files: FileList) => {
    setStatus(AppStatus.LOADING_DOC);
    try {
      const newDocs: AgentDocument[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await extractTextFromFile(file);
        newDocs.push({
          id: Math.random().toString(36).substr(2, 9),
          title: file.name,
          content: text,
          lastUpdated: new Date()
        });
      }
      
      const updatedDocuments = [...activeAgent.documents, ...newDocs];
      const updatedAgent = {
        ...activeAgent,
        documents: updatedDocuments,
        messages: activeAgent.messages.length === 0 ? [{
          id: 'welcome-' + Date.now(),
          role: 'model' as const,
          text: `**Xin chào Anh/Chị!** 👋\n\nTôi là Trợ lý AI của **Vinaseed - ${activeAgent.name}**. Tôi đã xử lý thành công **${newDocs.length} tài liệu** vừa tải lên.\n\nAnh/Chị có thể đặt các câu hỏi liên quan đến nội dung quy chế này. Tôi sẽ phân tích và đưa ra câu trả lời chính xác kèm dẫn chiếu cụ thể.`,
          timestamp: new Date()
        }] : activeAgent.messages
      };

      setAgents(prev => prev.map(a => a.id === activeAgentId ? updatedAgent : a));
      setStatus(AppStatus.READY);

      const aiSuggestions = await geminiService.getSuggestions(updatedDocuments, activeAgent.type);
      setAgents(prev => prev.map(a => a.id === activeAgentId ? { ...updatedAgent, suggestions: aiSuggestions } : a));
    } catch (error: any) {
      alert("Lỗi: " + error.message);
      setStatus(AppStatus.IDLE);
    }
  };

  const onRemoveFile = (agentId: string, fileId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const updatedDocs = agent.documents.filter(d => d.id !== fileId);
        return { ...agent, documents: updatedDocs };
      }
      return agent;
    }));
  };

  const handleSendMessage = async (textOverride?: string) => {
    const text = textOverride || inputText;
    if (!text.trim() || activeAgent.documents.length === 0 || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    const newMessages = [...activeAgent.messages, userMsg];
    setAgents(prev => prev.map(a => a.id === activeAgentId ? { ...a, messages: newMessages, suggestions: [] } : a));
    setInputText('');
    setIsTyping(true);

    try {
      const history = newMessages.filter(m => !m.id.startsWith('welcome')).map(m => ({ role: m.role, text: m.text }));
      const response = await geminiService.askQuestion(activeAgent.documents, text, history, activeAgent.type);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      setAgents(prev => prev.map(a => a.id === activeAgentId ? { ...a, messages: [...newMessages, aiMsg] } : a));
    } catch (error: any) {
      setAgents(prev => prev.map(a => a.id === activeAgentId ? { 
        ...a, 
        messages: [...newMessages, { id: 'err', role: 'model', text: "❌ Có lỗi kết nối: " + error.message, timestamp: new Date() }] 
      } : a));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f7f3] text-slate-900 overflow-hidden font-['Plus_Jakarta_Sans']">
      <Sidebar 
        agents={agents}
        activeAgentId={activeAgentId}
        status={status}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectAgent={setActiveAgentId}
        onAddAgent={onAddAgent}
        onDeleteAgent={onDeleteAgent}
        onFilesSelect={onFilesSelect}
        onRemoveFile={onRemoveFile}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-2xl lg:rounded-l-[40px] border-l border-emerald-100 relative z-10 hero-gradient">
        <header className="h-16 md:h-20 bg-white/60 backdrop-blur-md border-b border-emerald-50 flex items-center px-4 md:px-10 justify-between lg:rounded-tl-[40px]">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-emerald-50 rounded-lg text-emerald-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#008d44] rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-lg font-bold text-slate-800 truncate max-w-[120px] md:max-w-none">{activeAgent.name}</h2>
                <div className="hidden xs:block px-1.5 py-0.5 bg-yellow-400 text-[8px] md:text-[10px] font-black text-emerald-900 rounded-md uppercase tracking-wider">
                  {activeAgent.type}
                </div>
              </div>
              <p className="hidden md:block text-[10px] text-emerald-700/70 font-bold uppercase tracking-widest">
                {activeAgent.documents.length === 0 ? "Sẵn sàng" : `Đã nạp ${activeAgent.documents.length} văn bản`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-[#008d44] rounded-full animate-pulse"></div>
            <span className="text-[8px] md:text-[10px] font-bold text-[#008d44] uppercase tracking-widest">LIVE AI</span>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          {activeAgent.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto animate-in fade-in duration-1000 px-4">
              <div className="mb-6 md:mb-10 relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-50 scale-150"></div>
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-[30px] md:rounded-[40px] flex items-center justify-center shadow-2xl border border-emerald-50 transition-transform duration-500 hover:rotate-6">
                  <Sprout className="w-12 h-12 md:w-16 md:h-16 text-[#008d44]" />
                </div>
              </div>
              
              <h3 className="text-2xl md:text-4xl font-black text-slate-800 mb-4 md:mb-6 tracking-tight">
                Vinaseed <span className="text-[#008d44]">Legal AI</span>
              </h3>
              <p className="text-slate-500 text-sm md:text-lg leading-relaxed mb-8 md:mb-10 font-medium max-w-lg">
                Hệ thống trí tuệ nhân tạo tra cứu quy định nội bộ Vinaseed dành cho cán bộ nhân viên.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full">
                <div className="p-4 md:p-6 bg-white border border-emerald-50 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all">
                  <BookOpen className="w-5 h-5 text-[#008d44] mx-auto mb-3" />
                  <h4 className="text-[10px] md:text-xs font-black text-slate-800 uppercase mb-1">Đọc văn bản</h4>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-medium leading-tight">Phân tích đồng thời nhiều quy định.</p>
                </div>
                <div className="p-4 md:p-6 bg-white border border-emerald-50 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all">
                  <Sparkles className="w-5 h-5 text-[#008d44] mx-auto mb-3" />
                  <h4 className="text-[10px] md:text-xs font-black text-slate-800 uppercase mb-1">Hiểu ý nghĩa</h4>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-medium leading-tight">Giải đáp linh hoạt các vướng mắc quy trình.</p>
                </div>
                <div className="p-4 md:p-6 bg-white border border-emerald-50 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all">
                  <ShieldCheck className="w-5 h-5 text-[#008d44] mx-auto mb-3" />
                  <h4 className="text-[10px] md:text-xs font-black text-slate-800 uppercase mb-1">Bảo mật</h4>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-medium leading-tight">Dữ liệu phân tích an toàn tuyệt đối.</p>
                </div>
              </div>

              <div className="mt-8 md:mt-12 flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                <Info className="w-4 h-4" />
                <span className="text-[9px] md:text-[11px] font-bold">Hãy nạp văn bản từ menu để bắt đầu</span>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {activeAgent.messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {activeAgent.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {activeAgent.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(s)}
                      className="px-4 py-2 bg-white border border-emerald-100 text-[#008d44] rounded-xl text-[11px] font-bold hover:bg-[#008d44] hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start gap-4 mt-8">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Loader2 className="w-4 h-4 text-[#008d44] animate-spin" />
                  </div>
                  <div className="bg-white border border-emerald-100 rounded-2xl rounded-tl-none p-4 shadow-sm min-w-[60px]">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[#008d44] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#008d44] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#008d44] rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="p-4 md:p-8 bg-white/70 backdrop-blur-md border-t border-emerald-50">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="relative group"
            >
              <input
                type="text"
                disabled={activeAgent.documents.length === 0 || isTyping}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={activeAgent.documents.length > 0 ? `Hỏi Trợ lý Vinaseed...` : "Nạp văn bản để đặt câu hỏi"}
                className="w-full bg-white border border-slate-200 rounded-2xl md:rounded-3xl py-4 md:py-6 pl-5 md:pl-8 pr-16 md:pr-20 focus:ring-4 focus:ring-emerald-500/5 focus:border-[#008d44] transition-all text-sm md:text-[15px] text-slate-700 shadow-xl shadow-emerald-900/5 placeholder:text-slate-300"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || activeAgent.documents.length === 0 || isTyping}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-[#008d44] text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-[#007a3a] disabled:bg-slate-200 transition-all shadow-xl active:scale-90"
              >
                <Send className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </form>
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 md:mt-6 px-4 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[8px] md:text-[9px] text-emerald-700 font-black uppercase tracking-widest">Vinaseed Intelligence System</span>
              </div>
              <span className="text-[8px] md:text-[9px] text-slate-300 font-medium">© 2024 Vinaseed Group. Lưu hành nội bộ.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
